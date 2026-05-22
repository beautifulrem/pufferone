import { useMutation, useQueryClient } from '@tanstack/react-query'
import { parseEther, type Hash } from 'viem'
import { CONTRACTS, ETH_UNSTAKE_ABI, isDeployed } from '../lib/contracts'
import { simulate } from '../lib/simulate'
import { useWallet } from './useWallet'

export type UnstakeETHInput = {
  /// pufETH amount in decimal string ("0.5") — converted to wei here
  amount: string
}

export type UnstakeETHResult = {
  txHash: Hash
  pufETHIn: bigint
  ethOut: bigint
}

export type UnstakeETHError =
  | { kind: 'not-deployed' }
  | { kind: 'not-connected' }
  | { kind: 'wrong-chain' }
  | { kind: 'simulation-failed'; reason: string }
  | { kind: 'signing-rejected'; reason: string }
  | { kind: 'unknown'; reason: string }

export function useUnstakeETH() {
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation<UnstakeETHResult, UnstakeETHError, UnstakeETHInput>({
    mutationFn: async ({ amount }) => {
      if (!isDeployed()) throw { kind: 'not-deployed' } satisfies UnstakeETHError
      if (!wallet.walletClient || !wallet.address) {
        throw { kind: 'not-connected' } satisfies UnstakeETHError
      }

      const pufETHIn = parseEther(amount)

      // 1) 签名前预演（5 项保护 #1）
      const sim = await simulate<bigint>(wallet.publicClient, {
        account: wallet.address,
        address: CONTRACTS.ethUnstake,
        abi: ETH_UNSTAKE_ABI,
        functionName: 'unstakeETH',
        args: [pufETHIn],
      })
      if (!sim.ok) {
        throw {
          kind: 'simulation-failed',
          reason: sim.revertReason ?? sim.error,
        } satisfies UnstakeETHError
      }

      // 2) 广播
      let txHash: Hash
      try {
        txHash = await wallet.walletClient.writeContract({
          address: CONTRACTS.ethUnstake,
          abi: ETH_UNSTAKE_ABI,
          functionName: 'unstakeETH',
          args: [pufETHIn],
          account: wallet.address,
          chain: wallet.walletClient.chain,
        })
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err)
        throw {
          kind: reason.toLowerCase().includes('rejected') ? 'signing-rejected' : 'unknown',
          reason,
        } satisfies UnstakeETHError
      }

      // 3) 等待回执 + 刷新余额
      await wallet.publicClient.waitForTransactionReceipt({ hash: txHash })
      void qc.invalidateQueries({ queryKey: ['token-balance', CONTRACTS.pufETH] })
      void qc.invalidateQueries({ queryKey: ['native-balance'] })

      return { txHash, pufETHIn, ethOut: sim.result }
    },
  })
}
