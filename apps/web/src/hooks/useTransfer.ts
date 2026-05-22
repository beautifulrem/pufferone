import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Address, Hash } from 'viem'
import { ERC20_ABI } from '../lib/contracts'
import { simulate } from '../lib/simulate'
import { useWallet } from './useWallet'

export type TransferInput = {
  /// ERC-20 contract address (must support standard `transfer(address,uint256)`)
  token: Address
  /// 接收地址
  to: Address
  /// 数额（wei）
  amount: bigint
}

export type TransferResult = {
  txHash: Hash
  to: Address
  amount: bigint
}

export function useTransfer() {
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation<TransferResult, Error, TransferInput>({
    mutationFn: async ({ token, to, amount }) => {
      if (!wallet.walletClient || !wallet.address) {
        throw new Error('钱包未连接')
      }
      if (amount === 0n) {
        throw new Error('数量必须大于 0')
      }

      // 1) 链上预演（5 项保护 #1）
      const sim = await simulate(wallet.publicClient, {
        account: wallet.address,
        address: token,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, amount],
      })
      if (!sim.ok) {
        throw new Error(sim.revertReason ?? sim.error ?? '交易预演失败')
      }

      // 2) 广播
      const txHash = await wallet.walletClient.writeContract({
        address: token,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [to, amount],
        account: wallet.address,
        chain: wallet.walletClient.chain,
      })

      // 3) 等待回执，刷新余额
      await wallet.publicClient.waitForTransactionReceipt({ hash: txHash })
      void qc.invalidateQueries({ queryKey: ['token-balance', token] })

      return { txHash, to, amount }
    },
  })
}
