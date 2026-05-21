import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseEther, type Address, type Hash } from 'viem'
import { CONTRACTS, SWAP_ROUTER_ABI, isDeployed } from '../lib/contracts'
import { simulate } from '../lib/simulate'
import { useWallet } from './useWallet'

export type SwapInput = {
  amount: string // human-readable input amount
  path: readonly Address[]
  minAmountOut: bigint
}

export type SwapResult = {
  txHash: Hash
  amountIn: bigint
  amountOut: bigint
}

export type SwapError =
  | { kind: 'not-deployed' }
  | { kind: 'not-connected' }
  | { kind: 'wrong-chain' }
  | { kind: 'simulation-failed'; reason: string }
  | { kind: 'signing-rejected'; reason: string }
  | { kind: 'unknown'; reason: string }

export function useSwap() {
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation<SwapResult, SwapError, SwapInput>({
    mutationFn: async ({ amount, path, minAmountOut }) => {
      if (!isDeployed()) throw { kind: 'not-deployed' } satisfies SwapError
      if (!wallet.walletClient || !wallet.address) {
        throw { kind: 'not-connected' } satisfies SwapError
      }
      if (!wallet.isCorrectChain) throw { kind: 'wrong-chain' } satisfies SwapError

      const amountIn = parseEther(amount)
      const account = wallet.address

      const sim = await simulate<bigint>(wallet.publicClient, {
        address: CONTRACTS.swapRouter,
        abi: SWAP_ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [amountIn, minAmountOut, path],
        account,
      })
      if (!sim.ok) {
        throw {
          kind: 'simulation-failed',
          reason: sim.revertReason ?? sim.error,
        } satisfies SwapError
      }

      try {
        const txHash = await wallet.walletClient.writeContract({
          address: CONTRACTS.swapRouter,
          abi: SWAP_ROUTER_ABI,
          functionName: 'swapExactTokensForTokens',
          args: [amountIn, minAmountOut, path],
          account,
          chain: wallet.walletClient.chain,
        })
        await wallet.publicClient.waitForTransactionReceipt({ hash: txHash })
        for (const token of path) {
          void qc.invalidateQueries({ queryKey: ['token-balance', token] })
        }
        return { txHash, amountIn, amountOut: sim.result }
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        throw {
          kind: /user rejected|denied/i.test(reason) ? 'signing-rejected' : 'unknown',
          reason,
        } satisfies SwapError
      }
    },
  })
}

/// Computes quote (read-only) for a swap path. Useful for preview before signing.
export async function quoteSwap(
  publicClient: ReturnType<typeof useWallet>['publicClient'],
  amountIn: bigint,
  path: readonly Address[],
): Promise<bigint> {
  return (await publicClient.readContract({
    address: CONTRACTS.swapRouter,
    abi: SWAP_ROUTER_ABI,
    functionName: 'quote',
    args: [amountIn, path],
  })) as bigint
}
