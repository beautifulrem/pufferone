import { useQuery } from '@tanstack/react-query'
import { CONTRACTS, ERC20_ABI, isDeployed } from '../lib/contracts'
import { useWallet } from './useWallet'

export function usePufETHBalance() {
  const wallet = useWallet()
  const address = wallet.address

  return useQuery({
    queryKey: ['pufeth-balance', address, CONTRACTS.pufETH],
    enabled: isDeployed() && address !== null,
    queryFn: async () => {
      if (!address) return 0n
      const balance = (await wallet.publicClient.readContract({
        address: CONTRACTS.pufETH,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
      })) as bigint
      return balance
    },
    staleTime: 10_000, // refresh balances more often than other API data
    refetchInterval: 15_000,
  })
}
