/// Spothq cryptocurrency-icons CDN.
/// Source: https://github.com/spothq/cryptocurrency-icons
const SPOTHQ = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color'

/// Tokens that exist in Spothq directly.
const DIRECT: Record<string, string> = {
  ETH: `${SPOTHQ}/eth.svg`,
  WETH: `${SPOTHQ}/eth.svg`,
  STETH: `${SPOTHQ}/steth.svg`,
  WSTETH: `${SPOTHQ}/steth.svg`, // wstETH 复用 stETH 图标，外部加 W 标记
  USDC: `${SPOTHQ}/usdc.svg`,
  USDT: `${SPOTHQ}/usdt.svg`,
  WBTC: `${SPOTHQ}/wbtc.svg`,
  BTC: `${SPOTHQ}/btc.svg`,
}

/// Tokens that need a custom gradient overlay (no CDN icon).
/// Uniswap-clean palette: pink primary + soft cyan/purple/amber accents.
const GRADIENT: Record<string, { from: string; to: string; label: string }> = {
  PUFETH: { from: '#FC72FF', to: '#A78BFA', label: 'P' },
  UNIFIETH: { from: '#FC72FF', to: '#7D8AFC', label: 'uE' },
  UNIFIUSD: { from: '#5EEAD4', to: '#7D8AFC', label: 'uU' },
  UNIFIBTC: { from: '#FBBF24', to: '#FC72FF', label: 'uB' },
  PUFETHS: { from: '#A78BFA', to: '#FC72FF', label: 'P+' },
}

export type TokenIconInfo =
  | { kind: 'direct'; url: string }
  | { kind: 'gradient'; from: string; to: string; label: string }
  | { kind: 'fallback'; label: string }

export function getTokenIcon(symbol: string): TokenIconInfo {
  const upper = symbol.toUpperCase()
  if (upper in DIRECT) {
    const url = DIRECT[upper]
    if (url) return { kind: 'direct', url }
  }
  if (upper in GRADIENT) {
    const g = GRADIENT[upper]
    if (g) return { kind: 'gradient', from: g.from, to: g.to, label: g.label }
  }
  return { kind: 'fallback', label: upper.slice(0, 2) }
}
