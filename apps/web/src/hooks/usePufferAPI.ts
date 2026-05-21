import { useQuery } from '@tanstack/react-query'
import { pufferApi } from '../lib/pufferApi'

export function usePufETHRate() {
  return useQuery({
    queryKey: ['puffer-api', 'pufeth-rate'],
    queryFn: pufferApi.pufETHRate,
  })
}

export function useVaultAPYs() {
  return useQuery({
    queryKey: ['puffer-api', 'vaults-apy'],
    queryFn: pufferApi.vaultsAPY,
  })
}

export function useVaultTVLs() {
  return useQuery({
    queryKey: ['puffer-api', 'vaults-tvl'],
    queryFn: pufferApi.vaultsTVL,
  })
}

export function useProtocolTVL() {
  return useQuery({
    queryKey: ['puffer-api', 'protocol-tvl'],
    queryFn: pufferApi.protocolTVL,
  })
}
