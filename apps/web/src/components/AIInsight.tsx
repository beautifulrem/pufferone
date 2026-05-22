import { Sparkles } from 'lucide-react'
import { useMemo } from 'react'

/// AIInsight — rule-based "AI assistant" risk commentary.
///
/// Real LLM API requires keys and adds attack surface (per CLAUDE.md security
/// rules). Instead we run a small dispatch table keyed on `operation × amount
/// bucket × risk tier`. The output reads like a one-paragraph AI summary and
/// adapts as the user changes inputs.

export type InsightContext =
  | { operation: 'stake'; amount: bigint; tokenIn: string }
  | { operation: 'swap'; amount: bigint; tokenIn: string }
  | {
      operation: 'deposit'
      amount: bigint
      vaultName: string
      risk: 'Low' | 'Medium' | 'Elevated'
    }
  | { operation: 'withdraw'; vaultName: string }

type Insight = { headline: string; body: string }

function generateInsight(ctx: InsightContext): Insight {
  switch (ctx.operation) {
    case 'stake': {
      const amountEth = Number(ctx.amount) / 1e18
      if (amountEth === 0) {
        return {
          headline: '请输入质押数量',
          body: '签名前我会在链上预演交易，确保不会失败浪费 gas。pufETH 是流动再质押凭证，可在 DeFi 协议中继续使用。',
        }
      }
      if (amountEth < 0.05) {
        return {
          headline: '小额体验，风险极低',
          body: `${amountEth.toFixed(4)} ${ctx.tokenIn} 属于新手试水级别。交易已通过链上模拟，链上数据均已校验，可放心签名。`,
        }
      }
      if (amountEth < 1) {
        return {
          headline: '常规金额，风险可控',
          body: `${ctx.tokenIn} 是以太坊主网头部资产，Puffer 累计 TVL 超过 $58M，属于行业前列 LRT 协议。请留意 EigenLayer AVS 模块的削减（Slashing）风险。`,
        }
      }
      return {
        headline: '较大金额，建议关注退出路径',
        body: `本次质押 ${amountEth.toFixed(2)} ${ctx.tokenIn}。建议关注当前 Puffer 验证人集中度与 pufETH/ETH 二级市场深度，必要时可使用赎回模块或闪兑分批退出。`,
      }
    }

    case 'swap': {
      const amountEth = Number(ctx.amount) / 1e18
      if (amountEth === 0) {
        return {
          headline: '请输入兑换数量',
          body: '闪兑会在链上强制 minOut 保护：若路由价格突变导致实际收到少于阈值，合约会自动回滚，资金原路退回。',
        }
      }
      return {
        headline: '价格保护已开启',
        body: `当前滑点容忍 ${(0.5).toFixed(2)}% 以内有效。MockSwapRouter 在主网上对应 Uniswap V3 多跳路由，可避免单池被夹击的风险。`,
      }
    }

    case 'deposit': {
      const amountEth = Number(ctx.amount) / 1e18
      const sizeHint =
        amountEth === 0
          ? ''
          : amountEth < 0.5
            ? '小额试探的'
            : amountEth < 5
              ? '常规仓位的'
              : '较大仓位的'
      const map: Record<typeof ctx.risk, Insight> = {
        Low: {
          headline: '稳健型策略，本金波动有限',
          body: `${sizeHint}${ctx.vaultName} 本金主要跟随基础资产，收益来自 Puffer 再质押与 EigenLayer AVS 奖励。适合长期持仓与新手用户。`,
        },
        Medium: {
          headline: '平衡型策略，承担适度市场风险',
          body: `${sizeHint}${ctx.vaultName} 会进入 BTCfi 等跨链生态，本金会跟随 BTC 行情波动。建议你能接受短期价格变化，并保留部分流动头寸。`,
        },
        Elevated: {
          headline: '进取型策略，波动较大',
          body: `${sizeHint}${ctx.vaultName} 使用 Pendle 利率衍生品放大收益，潜在年化最高但同时面临利率与流动性风险。建议先用小额尝试再加仓。`,
        },
      }
      return map[ctx.risk]
    }

    case 'withdraw':
      return {
        headline: '即将赎回',
        body: `${ctx.vaultName} 份额将按当前金库价格折算为 pufETH。本演示不走主网 1-2 周的官方提款队列，赎回会立即完成。`,
      }
  }
}

export function AIInsight({ ctx }: { ctx: InsightContext }) {
  const { headline, body } = useMemo(() => generateInsight(ctx), [ctx])
  return (
    <div
      className="rounded-lg border p-3"
      style={{
        background: 'var(--ai-subtle-bg)',
        borderColor: 'var(--ai-subtle-border)',
      }}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Sparkles size={14} style={{ color: 'var(--ai-emphasis)' }} />
        <span
          className="font-mono text-[10px] uppercase tracking-wider"
          style={{ color: 'var(--ai-emphasis)' }}
        >
          AI 助手
        </span>
      </div>
      <p className="font-semibold text-foreground text-sm">{headline}</p>
      <p className="mt-1 text-text-tertiary text-xs leading-relaxed">{body}</p>
    </div>
  )
}
