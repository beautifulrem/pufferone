import type { Address } from 'viem'
import { CONTRACTS } from './contracts'

/// Token catalogue for the DEX aggregator page.
///
/// On Sepolia we only have stETH / wstETH mock contracts that can actually
/// participate in the swap router (`MockSwapRouter` has registered rates for
/// these pairs). The other tokens listed here exist on Ethereum mainnet and
/// are shown for product completeness — selecting them triggers a transparent
/// "main-net only" notice with a link to the live Puffer entry point, rather
/// than silently pretending to swap.
///
/// `rate` is the approximate amount of pufETH obtained per 1 input token,
/// scaled by 100 (bps). 96 means 1 stETH ≈ 0.96 pufETH.

export type SwapToken = {
  key: string
  symbol: string
  fullName: string
  /// Sepolia contract address, only set when actually swappable on testnet
  sepoliaAddress?: Address
  /// Main-net contract for reference / link out
  mainnetAddress?: string
  /// Indicative pufETH conversion ratio (× / 100)
  rateBps: bigint
  /// True if user can actually sign a Sepolia swap with this token
  sepoliaSignable: boolean
}

export const SWAP_TOKENS: readonly SwapToken[] = [
  {
    key: 'stETH',
    symbol: 'stETH',
    fullName: 'Lido Staked ETH',
    sepoliaAddress: CONTRACTS.stETH,
    mainnetAddress: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
    rateBps: 96n,
    sepoliaSignable: true,
  },
  {
    key: 'wstETH',
    symbol: 'wstETH',
    fullName: 'Wrapped stETH',
    sepoliaAddress: CONTRACTS.wstETH,
    mainnetAddress: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    rateBps: 112n,
    sepoliaSignable: true,
  },
  {
    key: 'USDC',
    symbol: 'USDC',
    fullName: 'USD Coin',
    mainnetAddress: '0xA0b86991c6218b36c1D19D4a2e9Eb0cE3606eB48',
    rateBps: 0n, // 取决于实时 ETH/USDC 汇率，存入弹窗只展示
    sepoliaSignable: false,
  },
  {
    key: 'USDT',
    symbol: 'USDT',
    fullName: 'Tether USD',
    mainnetAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    rateBps: 0n,
    sepoliaSignable: false,
  },
  {
    key: 'DAI',
    symbol: 'DAI',
    fullName: 'Dai Stablecoin',
    mainnetAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    rateBps: 0n,
    sepoliaSignable: false,
  },
  {
    key: 'WBTC',
    symbol: 'WBTC',
    fullName: 'Wrapped BTC',
    mainnetAddress: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    rateBps: 0n,
    sepoliaSignable: false,
  },
  {
    key: 'cbETH',
    symbol: 'cbETH',
    fullName: 'Coinbase Wrapped Staked ETH',
    mainnetAddress: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    rateBps: 105n,
    sepoliaSignable: false,
  },
  {
    key: 'rETH',
    symbol: 'rETH',
    fullName: 'Rocket Pool ETH',
    mainnetAddress: '0xae78736Cd615f374D3085123A210448E74Fc6393',
    rateBps: 108n,
    sepoliaSignable: false,
  },
] as const

export const MAINNET_AGGREGATOR_URL = 'https://app.puffer.fi/'
