import { useQuery } from '@tanstack/react-query'
import { pufferApi } from '../lib/pufferApi'

/// Puffer API hooks — main-net read-only data.
///
/// Rate limit is 100 req/15 min/IP, so we cache aggressively. Stale data is fine
/// for a demo (rates / TVL don't move fast). On failure the consumers fall back
/// to hand-curated mock values so the page never breaks.

// Puffer API 限速 100 req / 15 min / IP。这里把 staleTime 设到 5 分钟、
// refetchInterval 设到 10 分钟、关闭 retry，配合 lib/pufferApi.ts 内的
// sessionStorage 缓存层，远远低于限速窗口。
const STALE_MS = 5 * 60_000 // 5 minutes
const REFETCH_MS = 10 * 60_000 // 10 minutes

export function usePufETHRate() {
  return useQuery({
    queryKey: ['puffer-api', 'pufeth-rate'],
    queryFn: pufferApi.pufETHRate,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    retry: 0,
    refetchOnWindowFocus: false,
  })
}

export function useVaultAPYs() {
  return useQuery({
    queryKey: ['puffer-api', 'vaults-apy'],
    queryFn: pufferApi.vaultsAPY,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    retry: 0,
    refetchOnWindowFocus: false,
  })
}

export function useVaultTVLs() {
  return useQuery({
    queryKey: ['puffer-api', 'vaults-tvl'],
    queryFn: pufferApi.vaultsTVL,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    retry: 0,
    refetchOnWindowFocus: false,
  })
}

export function useProtocolTVL() {
  return useQuery({
    queryKey: ['puffer-api', 'protocol-tvl'],
    queryFn: pufferApi.protocolTVL,
    staleTime: STALE_MS,
    refetchInterval: REFETCH_MS,
    retry: 0,
    refetchOnWindowFocus: false,
  })
}
