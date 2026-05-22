import { useQuery } from '@tanstack/react-query'
import { useWallet } from './useWallet'

export function useNativeBalance() {
  const wallet = useWallet()
  const address = wallet.address

  return useQuery({
    queryKey: ['native-balance', address],
    enabled: address !== null,
    queryFn: async (): Promise<bigint> => {
      if (!address) return 0n
      return await wallet.publicClient.getBalance({ address })
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
  })
}
