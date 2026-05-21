/// Puffer Finance mainnet API client.
/// Base URL: https://api-v2.puffer.fi/imtoken-hackathon
/// Rate limit: 100 requests per 15 minutes per IP.
///
/// We fetch read-only mainnet data (APY, TVL, rates) and combine it with our
/// own Sepolia mock contracts for actual user transactions. This gives the
/// demo a realistic data layer without exposing mainnet contracts to demo txs.

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

type VaultAPYEntry = {
  vault: string
  apy: number
}

type VaultTVLEntry = {
  vault: string
  tvl: number
}

type ProtocolTVLResponse = {
  totalTVL: number
  pufETHStakingAPY: number
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Puffer API ${path} returned ${res.status}`)
  }
  return (await res.json()) as T
}

export const pufferApi = {
  pufETHRate: () => fetchJSON<PufETHRateResponse>('/pufeth/rate'),
  pufETHMetrics: () => fetchJSON<PufETHMetricsResponse>('/pufeth/metrics'),
  vaultsAPY: () => fetchJSON<VaultAPYEntry[]>('/vaults/apy'),
  vaultsTVL: () => fetchJSON<VaultTVLEntry[]>('/vaults/tvl'),
  protocolTVL: () => fetchJSON<ProtocolTVLResponse>('/protocol/tvl'),
}
