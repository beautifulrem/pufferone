/// Puffer Finance mainnet API client.
/// Base URL: https://api-v2.puffer.fi/imtoken-hackathon
/// Rate limit: 100 requests per 15 minutes per IP.
///
/// We add two layers of robustness:
/// 1. sessionStorage cache (TTL = 5 min) — saves the last good response per
///    endpoint so a page refresh doesn't re-hit the limit
/// 2. 429 fallback — if the live request fails with rate-limit, we serve the
///    most recently cached value (even if expired) instead of an error, so the
///    UI never collapses to "offline" mode just because the IP got throttled

const BASE_URL =
  import.meta.env.VITE_PUFFER_API_BASE ?? 'https://api-v2.puffer.fi/imtoken-hackathon'

type PufETHRateResponse = {
  pufEthPerEth: string
  ethPerPufEth: string
  totalAssets: string
  totalSupply: string
}

type PufETHMetricsResponse = {
  marketCap?: number
  dailyVolume?: number
  holderCount?: number
}

export type VaultAPYEntry = {
  vault: string
  apy: number
}

export type VaultTVLEntry = {
  vault: string
  tvl: number
}

export type ProtocolTVLResponse = {
  totalTVL: number
  pufETHStakingAPY: number
  unifiTVL: number
}

const CACHE_TTL_MS = 5 * 60_000 // 5 minutes

function cacheKey(path: string): string {
  return `pufferone:api:${path}`
}

function readCache<T>(path: string, includeStale = false): T | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(cacheKey(path))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { data: T; ts: number }
    if (!includeStale && Date.now() - parsed.ts > CACHE_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(path: string, data: unknown): void {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(cacheKey(path), JSON.stringify({ data, ts: Date.now() }))
  } catch {
    // Quota exceeded etc — silent
  }
}

async function fetchJSON<T>(path: string): Promise<T> {
  const cached = readCache<T>(path)
  if (cached) return cached

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: 'application/json' },
    })
  } catch (err) {
    // Network error — try stale cache before giving up
    const stale = readCache<T>(path, true)
    if (stale) return stale
    throw err
  }

  if (!res.ok) {
    // 429 / 5xx — serve stale cache if available, otherwise throw
    const stale = readCache<T>(path, true)
    if (stale) return stale
    throw new Error(`Puffer API ${path} returned ${res.status}`)
  }

  const data = (await res.json()) as T
  writeCache(path, data)
  return data
}

type RawProtocolTVL = {
  lrt_total_usd?: string
  unifi_total_usd?: string
  apy?: string
  tvl_puffer_staking?: string
}

type RawVaultTVL = Record<string, string>

type RawVaultAPY = {
  data?: { token_address: string; apy: string }[]
}

const VAULT_ADDRESS_MAP: Record<string, string> = {
  '0x196ead472583bc1e9af7a05f860d9857e1bd3dcc': 'unifiETH',
  '0x170d847a8320f3b6a77ee15b0cae430e3ec933a0': 'unifiUSD',
  '0x82c40e07277ebb92935f79ce92268f80ddc7cab4': 'unifiBTC',
}

const VAULT_KEY_MAP: Record<string, string> = {
  unifi_eth_vault: 'unifiETH',
  unifi_usd_vault: 'unifiUSD',
  unifi_btc_vault: 'unifiBTC',
}

export const pufferApi = {
  pufETHRate: () => fetchJSON<PufETHRateResponse>('/pufeth/rate'),
  pufETHMetrics: () => fetchJSON<PufETHMetricsResponse>('/pufeth/metrics'),

  vaultsAPY: async (): Promise<VaultAPYEntry[]> => {
    const raw = await fetchJSON<RawVaultAPY>('/vaults/apy')
    if (!raw.data || !Array.isArray(raw.data)) return []
    return raw.data.map((e) => ({
      vault: VAULT_ADDRESS_MAP[e.token_address.toLowerCase()] ?? e.token_address,
      apy: Number.parseFloat(e.apy) || 0,
    }))
  },

  vaultsTVL: async (): Promise<VaultTVLEntry[]> => {
    const raw = await fetchJSON<RawVaultTVL>('/vaults/tvl')
    return Object.entries(raw)
      .filter(([k]) => k in VAULT_KEY_MAP)
      .map(([k, v]) => ({
        vault: VAULT_KEY_MAP[k] ?? k,
        tvl: Number.parseFloat(v) || 0,
      }))
  },

  protocolTVL: async (): Promise<ProtocolTVLResponse> => {
    const raw = await fetchJSON<RawProtocolTVL>('/protocol/tvl')
    return {
      totalTVL: Number.parseFloat(raw.lrt_total_usd ?? '0') || 0,
      pufETHStakingAPY: Number.parseFloat(raw.apy ?? '0') || 0,
      unifiTVL: Number.parseFloat(raw.unifi_total_usd ?? '0') || 0,
    }
  },
}
