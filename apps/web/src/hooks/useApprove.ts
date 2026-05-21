import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Address, Hash } from 'viem'
import { ERC20_ABI } from '../lib/contracts'
import { useWallet } from './useWallet'

export type ApproveInput = {
  token: Address
  spender: Address
  amount: bigint // exact amount — never infinite (SKILL.md §1.1)
}

export function useApprove() {
  const wallet = useWallet()
  const qc = useQueryClient()

  return useMutation<Hash, Error, ApproveInput>({
    mutationFn: async ({ token, spender, amount }) => {
      if (!wallet.walletClient || !wallet.address) {
        throw new Error('Wallet not connected')
      }
      const txHash = await wallet.walletClient.writeContract({
        address: token,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [spender, amount],
        account: wallet.address,
        chain: wallet.walletClient.chain,
      })
      // Wait for confirmation so the subsequent deposit doesn't race
      await wallet.publicClient.waitForTransactionReceipt({ hash: txHash })
      // Invalidate so useAllowance picks up the new value immediately
      void qc.invalidateQueries({ queryKey: ['allowance', token] })
      return txHash
    },
  })
}
