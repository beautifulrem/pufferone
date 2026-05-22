/// Token icon source registry.
///
/// Strategy: try Trust Wallet first (most comprehensive ERC-20 logo DB indexed
/// by mainnet checksum address), then Spothq fallback for vanilla tokens
/// (BTC/ETH/USDT/etc). If both fail, the React component renders an inline
/// SVG with a gradient circle + letter glyph.
///
/// Sources:
/// - https://github.com/trustwallet/assets
/// - https://github.com/spothq/cryptocurrency-icons

const TRUST = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets'
const SPOTHQ = 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/svg/color'

/// Mainnet checksum addresses (case-sensitive — Trust Wallet pinned to checksum).
const MAINNET = {
  STETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  WSTETH: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  PUFETH: '0xD9A442856C234a39a81a089C06451EBAa4306a72',
  USDC: '0xA0b86991c6218b36c1D19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  CBETH: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
  RETH: '0xae78736Cd615f374D3085123A210448E74Fc6393',
} as const

/// Ordered list of CDN URLs to try for a token. The TokenIcon component will
/// try each in turn until one loads successfully.
function trustWalletUrl(addr: string): string {
  return `${TRUST}/${addr}/logo.png`
}

function spothqUrl(symbol: string): string {
  return `${SPOTHQ}/${symbol.toLowerCase()}.svg`
}

export type TokenSource =
  | { kind: 'urls'; urls: readonly string[]; symbol: string }
  | { kind: 'gradient'; from: string; to: string; label: string }
  | {
      kind: 'wrapped'
      base: TokenSource
      ringColor: string
      label: string
    }

/// Direct registry — order matters (first URL tried first).
const SOURCES: Record<string, TokenSource> = {
  ETH: { kind: 'urls', urls: [spothqUrl('eth')], symbol: 'ETH' },
  WETH: { kind: 'urls', urls: [spothqUrl('eth')], symbol: 'WETH' },
  STETH: {
    kind: 'urls',
    urls: [trustWalletUrl(MAINNET.STETH), spothqUrl('steth')],
    symbol: 'stETH',
  },
  WSTETH: {
    kind: 'urls',
    urls: [trustWalletUrl(MAINNET.WSTETH), spothqUrl('wsteth')],
    symbol: 'wstETH',
  },
  PUFETH: {
    kind: 'urls',
    urls: [trustWalletUrl(MAINNET.PUFETH)],
    symbol: 'pufETH',
  },
  USDC: { kind: 'urls', urls: [trustWalletUrl(MAINNET.USDC), spothqUrl('usdc')], symbol: 'USDC' },
  USDT: { kind: 'urls', urls: [trustWalletUrl(MAINNET.USDT), spothqUrl('usdt')], symbol: 'USDT' },
  WBTC: { kind: 'urls', urls: [trustWalletUrl(MAINNET.WBTC), spothqUrl('wbtc')], symbol: 'WBTC' },
  DAI: { kind: 'urls', urls: [trustWalletUrl(MAINNET.DAI), spothqUrl('dai')], symbol: 'DAI' },
  CBETH: {
    kind: 'urls',
    urls: [
      // Coinbase Wrapped Staked ETH — Trust Wallet 偶发 503，加 CoinGecko 作主源
      'https://assets.coingecko.com/coins/images/27008/large/cbeth.png',
      trustWalletUrl(MAINNET.CBETH),
      spothqUrl('cbeth'),
    ],
    symbol: 'cbETH',
  },
  RETH: {
    kind: 'urls',
    urls: [
      // Rocket Pool ETH — 同上
      'https://assets.coingecko.com/coins/images/20764/large/reth.png',
      trustWalletUrl(MAINNET.RETH),
      spothqUrl('reth'),
    ],
    symbol: 'rETH',
  },
}

/// Vault wrappers: a base token icon with a dashed ring overlay.
const WRAPS: Record<string, { base: keyof typeof SOURCES; ringColor: string; label: string }> = {
  UNIFIETH: { base: 'ETH', ringColor: '#FC72FF', label: 'unifiETH' },
  UNIFIUSD: { base: 'USDC', ringColor: '#7DD3FC', label: 'unifiUSD' },
  UNIFIBTC: { base: 'WBTC', ringColor: '#FBBF24', label: 'unifiBTC' },
  PUFETHS: { base: 'PUFETH', ringColor: '#A78BFA', label: 'pufETHs' },
}

export function getTokenSource(symbol: string): TokenSource {
  const upper = symbol.toUpperCase()
  if (upper in SOURCES) {
    const source = SOURCES[upper]
    if (source) return source
  }
  if (upper in WRAPS) {
    const wrap = WRAPS[upper]
    if (wrap) {
      const base = SOURCES[wrap.base]
      if (base) {
        return {
          kind: 'wrapped',
          base,
          ringColor: wrap.ringColor,
          label: wrap.label,
        }
      }
    }
  }
  return {
    kind: 'gradient',
    from: '#FC72FF',
    to: '#A78BFA',
    label: symbol.slice(0, 2).toUpperCase(),
  }
}
