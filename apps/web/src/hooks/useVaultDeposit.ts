import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseEther, type Address, type Hash } from 'viem'
import { CONTRACTS, VAULT_ABI, isDeployed } from '../lib/contracts'
import { simulate } from '../lib/simulate'
import { useWallet } from './useWallet'

export type VaultDepositInput = {
  vault: Address
  amount: string // human-readable, in pufETH
}

export type VaultDepositResult = {
  txHash: Hash
  expectedShares: bigint
  assetsIn: bigint
}

export type VaultDepositError =
  | { kind: 'not-deployed' }
  | { kind: 'not-connected' }
  | { kind: 'wrong-chain' }
  | { kind: 'simulation-failed'; reason: string }
  | { kind: 'signing-rejected'; reason: string }
  | { kind: 'unknown'; reason: string }

export function useVaultDeposit() {
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation<VaultDepositResult, VaultDepositError, VaultDepositInput>({
    mutationFn: async ({ vault, amount }) => {
      if (!isDeployed()) throw { kind: 'not-deployed' } satisfies VaultDepositError
      if (!wallet.walletClient || !wallet.address) {
        throw { kind: 'not-connected' } satisfies VaultDepositError
      }
      if (!wallet.isCorrectChain) throw { kind: 'wrong-chain' } satisfies VaultDepositError

      const assetsIn = parseEther(amount)
      const account = wallet.address

      // 1. Simulate
      const sim = await simulate<bigint>(wallet.publicClient, {
        address: vault,
        abi: VAULT_ABI,
        functionName: 'deposit',
        args: [assetsIn],
        account,
      })
      if (!sim.ok) {
        throw {
          kind: 'simulation-failed',
          reason: sim.revertReason ?? sim.error,
        } satisfies VaultDepositError
      }

      // 2. Sign + broadcast
      try {
        const txHash = await wallet.walletClient.writeContract({
          address: vault,
          abi: VAULT_ABI,
          functionName: 'deposit',
          args: [assetsIn],
          account,
          chain: wallet.walletClient.chain,
        })
        await wallet.publicClient.waitForTransactionReceipt({ hash: txHash })
        void qc.invalidateQueries({ queryKey: ['token-balance', CONTRACTS.pufETH] })
        void qc.invalidateQueries({ queryKey: ['token-balance', vault] })
        return { txHash, expectedShares: sim.result, assetsIn }
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        throw {
          kind: /user rejected|denied/i.test(reason) ? 'signing-rejected' : 'unknown',
          reason,
        } satisfies VaultDepositError
      }
    },
  })
}
