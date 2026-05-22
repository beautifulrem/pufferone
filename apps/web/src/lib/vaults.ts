import type { Address } from 'viem'
import { CONTRACTS } from './contracts'

export type VaultDescriptor = {
  key: 'unifiETH' | 'unifiUSD' | 'unifiBTC' | 'pufETHs'
  name: string
  /// 卡片上一行短描述
  description: string
  /// 存入弹窗里 2–3 句的详细产品说明
  intro: string
  /// 跳转到该产品的 Puffer / 合作方页面
  docsUrl: string
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
    intro:
      '通过 Puffer 流动再质押模块持续累积 ETH 共识奖励，并叠加 EigenLayer AVS 服务收益。策略管理人会动态调配 AVS 模块以平衡风险与回报，适合长期持有 ETH 并追求被动收益的用户。',
    docsUrl: 'https://www.puffer.fi/',
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
    intro:
      '将 pufETH 兑换为 USDC，参与 Aave、Compound 等借贷协议，并向 Uniswap V3 集中流动性池做市。完全规避币价波动，收益来自借贷利率与交易手续费，适合避险或短期周转资金。',
    docsUrl: 'https://www.puffer.fi/',
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
    intro:
      '将 pufETH 兑换为 WBTC，通过跨链桥进入 BTCfi 生态（如 Babylon、Solv Protocol）参与 BTC 再质押。本金价值跟随 BTC 行情波动，但可获得 BTCfi 协议的额外收益，适合看好 BTC 长期走势的用户。',
    docsUrl: 'https://www.puffer.fi/',
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
    intro:
      '基于 Pendle 协议拆分 pufETH 的本金（PT）与未来收益（YT），通过持有 YT 获得杠杆化的利率敞口。潜在年化最高，但需承担利率波动与流动性风险，适合熟悉 DeFi 利率市场的进阶用户。',
    docsUrl: 'https://app.pendle.finance/',
    address: CONTRACTS.pufETHs,
    accent: 'destructive',
    risk: 'Elevated',
    fallbackAPY: 7.5,
    fallbackTVL: 2_120_000,
    sharePrice: 1_075_000_000_000_000_000n, // 1.075e18
    highlight: 'hot',
  },
] as const
