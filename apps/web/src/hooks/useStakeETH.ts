import { useMutation } from '@tanstack/react-query'
import { parseEther, type Address, type Hash } from 'viem'
import { CONTRACTS, DEPOSITOR_ABI, isDeployed } from '../lib/contracts'
import { simulate } from '../lib/simulate'
import { useWallet } from './useWallet'

export type StakeETHInput = { amountEth: string } // human-readable, e.g. "0.1"

export type StakeETHResult = {
  txHash: Hash
  expectedPufETH: bigint
  inputWei: bigint
}

export type StakeETHError =
  | { kind: 'not-deployed' }
  | { kind: 'not-connected' }
  | { kind: 'wrong-chain' }
  | { kind: 'simulation-failed'; reason: string }
  | { kind: 'signing-rejected'; reason: string }
  | { kind: 'unknown'; reason: string }

export function useStakeETH() {
  const wallet = useWallet()

  return useMutation<StakeETHResult, StakeETHError, StakeETHInput>({
    mutationFn: async ({ amountEth }) => {
      if (!isDeployed()) {
        throw { kind: 'not-deployed' } satisfies StakeETHError
      }
      if (!wallet.walletClient || !wallet.address) {
        throw { kind: 'not-connected' } satisfies StakeETHError
      }
      if (!wallet.isCorrectChain) {
        throw { kind: 'wrong-chain' } satisfies StakeETHError
      }

      const value = parseEther(amountEth)
      const account: Address = wallet.address

      // 1. Simulate first — fail fast with revert reason if invalid
      const sim = await simulate<bigint>(wallet.publicClient, {
        address: CONTRACTS.depositor,
        abi: DEPOSITOR_ABI,
        functionName: 'depositETH',
        args: [],
        value,
        account,
      })

      if (!sim.ok) {
        throw {
          kind: 'simulation-failed',
          reason: sim.revertReason ?? sim.error,
        } satisfies StakeETHError
      }

      const expectedPufETH = sim.result

      // 2. Real sign + broadcast (wallet pops up to user)
      try {
        const txHash = await wallet.walletClient.writeContract({
          address: CONTRACTS.depositor,
          abi: DEPOSITOR_ABI,
          functionName: 'depositETH',
          args: [],
          value,
          account,
          chain: wallet.walletClient.chain,
        })
        return { txHash, expectedPufETH, inputWei: value }
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        throw {
          kind: /user rejected|denied/i.test(reason) ? 'signing-rejected' : 'unknown',
          reason,
        } satisfies StakeETHError
      }
    },
  })
}
