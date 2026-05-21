import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { ERC20_ABI } from '../lib/contracts'
import { useWallet } from './useWallet'

/// Reads ERC-20 allowance(owner, spender). Returns 0n when wallet not connected.
export function useAllowance(token: Address | undefined, spender: Address | undefined) {
  const wallet = useWallet()
  const owner = wallet.address

  return useQuery({
    queryKey: ['allowance', token, owner, spender],
    enabled: token !== undefined && spender !== undefined && owner !== null,
    queryFn: async (): Promise<bigint> => {
      if (!token || !spender || !owner) return 0n
      const allowance = (await wallet.publicClient.readContract({
        address: token,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner, spender],
      })) as bigint
      return allowance
    },
    staleTime: 10_000,
  })
}
