import type { Address } from 'viem'
import { CONTRACTS } from './contracts'

export type VaultDescriptor = {
  key: 'unifiETH' | 'unifiUSD' | 'unifiBTC' | 'pufETHs'
  name: string
  description: string
  /// Sepolia mock vault contract
  address: Address
  /// Color in design tokens — informs accent bar/icon tint
  accent: 'primary' | 'warning' | 'destructive' | 'ai'
  /// Risk level: lower = safer (mock data; in production from APY volatility + TVL stability)
  risk: 'Low' | 'Medium' | 'Elevated'
  /// Mock fallback APY shown when mainnet API is unavailable
  fallbackAPY: number
  /// Mock fallback TVL (USD)
  fallbackTVL: number
  /// Vault sharePrice (1e18 = 1:1) used for client-side preview
  sharePrice: bigint
  /// Optional editorial flag — '新手推荐' / '最热' badges shown on the card
  highlight?: 'beginner' | 'hot'
}

export const VAULTS: readonly VaultDescriptor[] = [
  {
    key: 'unifiETH',
    name: 'unifiETH',
    description: 'ETH 本位稳健策略，叠加 Puffer 再质押与 EigenLayer AVS 双重收益。',
    address: CONTRACTS.unifiETH,
    accent: 'primary',
    risk: 'Low',
    fallbackAPY: 5.0,
    fallbackTVL: 18_500_000,
    sharePrice: 1_050_000_000_000_000_000n, // 1.05e18
    highlight: 'beginner',
  },
  {
    key: 'unifiUSD',
    name: 'unifiUSD',
    description: 'USDC 本位稳定币策略，无币价敞口，收益来源于链上借贷与做市。',
    address: CONTRACTS.unifiUSD,
    accent: 'ai',
    risk: 'Low',
    fallbackAPY: 4.0,
    fallbackTVL: 9_300_000,
    sharePrice: 1_040_000_000_000_000_000n, // 1.04e18
  },
  {
    key: 'unifiBTC',
    name: 'unifiBTC',
    description: 'WBTC 本位策略，跟随 BTC 行情，叠加跨链 BTCfi 额外收益。',
    address: CONTRACTS.unifiBTC,
    accent: 'warning',
    risk: 'Medium',
    fallbackAPY: 5.5,
    fallbackTVL: 4_750_000,
    sharePrice: 1_055_000_000_000_000_000n, // 1.055e18
  },
  {
    key: 'pufETHs',
    name: 'pufETHs',
    description: 'pufETH 进阶版本，叠加 Pendle 利率衍生品，潜在年化最高。',
    address: CONTRACTS.pufETHs,
    accent: 'destructive',
    risk: 'Elevated',
    fallbackAPY: 7.5,
    fallbackTVL: 2_120_000,
    sharePrice: 1_075_000_000_000_000_000n, // 1.075e18
    highlight: 'hot',
  },
] as const
