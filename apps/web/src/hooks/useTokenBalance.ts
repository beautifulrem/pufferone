import { useQuery } from '@tanstack/react-query'
import type { Address } from 'viem'
import { ERC20_ABI } from '../lib/contracts'
import { useWallet } from './useWallet'

export function useTokenBalance(token: Address | undefined) {
  const wallet = useWallet()
  const address = wallet.address

  return useQuery({
    queryKey: ['token-balance', token, address],
    enabled: token !== undefined && address !== null,
    queryFn: async (): Promise<bigint> => {
      if (!token || !address) return 0n
      const balance = (await wallet.publicClient.readContract({
        address: token,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint
      return balance
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  })
}
