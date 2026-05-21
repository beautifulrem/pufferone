import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseEther, type Address, type Hash } from 'viem'
import { CONTRACTS, VAULT_ABI } from '../lib/contracts'
import { simulate } from '../lib/simulate'
import { useWallet } from './useWallet'

export type VaultWithdrawInput = {
  vault: Address
  shares: string // human-readable
}

export type VaultWithdrawResult = {
  txHash: Hash
  assetsOut: bigint
}

export type VaultWithdrawError = { kind: string; reason: string }

export function useVaultWithdraw() {
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation<VaultWithdrawResult, VaultWithdrawError, VaultWithdrawInput>({
    mutationFn: async ({ vault, shares }) => {
      if (!wallet.walletClient || !wallet.address) {
        throw { kind: 'not-connected', reason: 'Wallet not connected' }
      }
      if (!wallet.isCorrectChain) {
        throw { kind: 'wrong-chain', reason: 'Switch to Sepolia first' }
      }
      const sharesWei = parseEther(shares)
      const account = wallet.address

      const sim = await simulate<bigint>(wallet.publicClient, {
        address: vault,
        abi: VAULT_ABI,
        functionName: 'withdraw',
        args: [sharesWei],
        account,
      })
      if (!sim.ok) {
        throw {
          kind: 'simulation-failed',
          reason: sim.revertReason ?? sim.error,
        }
      }

      try {
        const txHash = await wallet.walletClient.writeContract({
          address: vault,
          abi: VAULT_ABI,
          functionName: 'withdraw',
          args: [sharesWei],
          account,
          chain: wallet.walletClient.chain,
        })
        await wallet.publicClient.waitForTransactionReceipt({ hash: txHash })
        void qc.invalidateQueries({ queryKey: ['token-balance', vault] })
        void qc.invalidateQueries({ queryKey: ['token-balance', CONTRACTS.pufETH] })
        return { txHash, assetsOut: sim.result }
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        throw {
          kind: /user rejected|denied/i.test(reason) ? 'signing-rejected' : 'unknown',
          reason,
        }
      }
    },
  })
}
