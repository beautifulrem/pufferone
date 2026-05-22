import type { Address } from 'viem'
import { CONTRACTS } from './contracts'

/// Token catalogue for the swap page.
///
/// 与 Puffer Finance 官方 Stake / EigenLayer Restaking 通道（app.puffer.fi/stake
/// 下 ETH tab 实测）保持一致：官方支持 ETH / stETH / wstETH / WETH 4 种
/// 输入资产。USDC / USDT / DAI / WBTC / cbETH / rETH 等其他代币官方
/// 不支持直接兑换为 pufETH，因此移除。
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
    key: 'WETH',
    symbol: 'WETH',
    fullName: 'Wrapped ETH',
    mainnetAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    rateBps: 96n,
    sepoliaSignable: false,
  },
] as const

export const MAINNET_AGGREGATOR_URL = 'https://app.puffer.fi/stake'
