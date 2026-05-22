import { useQuery } from '@tanstack/react-query'
import { pufferApi } from '../lib/pufferApi'

/// Puffer API hooks — main-net read-only data.
///
/// Rate limit is 100 req/15 min/IP, so we cache aggressively. Stale data is fine
/// for a demo (rates / TVL don't move fast). On failure the consumers fall back
/// to hand-curated mock values so the page never breaks.

const STALE_MS = 60_000 // 1 minute
const REFETCH_MS = 5 * 60_000 // 5 minutes

export function usePufETHRate() {
  return useQuery({
    queryKey: ['puffer-api', 'pufeth-rate'],
    queryFn: pufferApi.pufETHRate,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    retry: 1,
  })
}

export function useVaultAPYs() {
  return useQuery({
    queryKey: ['puffer-api', 'vaults-apy'],
    queryFn: pufferApi.vaultsAPY,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    retry: 1,
  })
}

export function useVaultTVLs() {
  return useQuery({
    queryKey: ['puffer-api', 'vaults-tvl'],
    queryFn: pufferApi.vaultsTVL,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    retry: 1,
  })
}

export function useProtocolTVL() {
  return useQuery({
    queryKey: ['puffer-api', 'protocol-tvl'],
    queryFn: pufferApi.protocolTVL,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    retry: 1,
  })
}
