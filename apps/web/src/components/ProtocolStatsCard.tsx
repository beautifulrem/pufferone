import { Activity, Layers, TrendingUp } from 'lucide-react'
import { type ComponentType, useState } from 'react'
import { useProtocolTVL } from '../hooks/usePufferAPI'
import { VAULTS } from '../lib/vaults'
import { MetricDetailModal, type MetricSpec } from './MetricDetailModal'

const FALLBACK_LRT_TVL = 58_900_000
const FALLBACK_UNIFI_TVL = 1_140_000
const FALLBACK_PUFETH_APY = 2.64

function formatCompactUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export function ProtocolStatsCard() {
  const protocol = useProtocolTVL()
  const [activeMetric, setActiveMetric] = useState<MetricSpec | null>(null)

  const lrtTVL =
    protocol.data?.totalTVL && protocol.data.totalTVL > 0
      ? protocol.data.totalTVL
      : FALLBACK_LRT_TVL

  const pufETHAPY =
    protocol.data?.pufETHStakingAPY && protocol.data.pufETHStakingAPY > 0
      ? protocol.data.pufETHStakingAPY
      : FALLBACK_PUFETH_APY

  const unifiTVL =
    protocol.data?.unifiTVL && protocol.data.unifiTVL > 0
      ? protocol.data.unifiTVL
      : FALLBACK_UNIFI_TVL

  const isLive = !protocol.isError && protocol.isSuccess

  const metrics: MetricSpec[] = [
    {
      key: 'lrt-tvl',
      label: 'LRT TVL',
      value: formatCompactUSD(lrtTVL),
      description: 'Puffer 流动再质押协议在以太坊主网的总锁仓价值，包含 ETH、stETH 等所有底层资产。',
      baseValue: lrtTVL,
      formatter: (n) => formatCompactUSD(n),
      Icon: Activity,
      accent: 'rgb(252 114 255)',
      isLive,
    },
    {
      key: 'unifi-tvl',
      label: 'UniFi TVL',
      value: formatCompactUSD(unifiTVL),
      description: 'UniFi 系列收益金库的总锁仓价值（unifiETH / unifiUSD / unifiBTC / pufETHs 合计）。',
      baseValue: unifiTVL,
      formatter: (n) => formatCompactUSD(n),
      Icon: Layers,
      accent: 'rgb(167 139 250)',
      isLive,
    },
    {
      key: 'pufeth-apy',
      label: 'pufETH 年化收益',
      value: `${pufETHAPY.toFixed(2)}%`,
      description: 'pufETH 在 Puffer 主网的年化收益率，由验证人共识奖励 + EigenLayer AVS 服务收益叠加构成。',
      baseValue: pufETHAPY,
      formatter: (n) => `${n.toFixed(2)}%`,
      Icon: TrendingUp,
      accent: 'rgb(125 211 252)',
      isLive,
    },
  ]

  return (
    <>
      <div className="rounded-xl border border-border bg-card/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="cyber-eyebrow">Puffer 协议规模</p>
          <span className="font-mono text-[10px] text-text-tertiary">
            {isLive ? '主网实时 · 点击查看走势' : '离线估算 · 点击查看走势'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((m) => (
            <StatCell key={m.key} metric={m} onClick={() => setActiveMetric(m)} />
          ))}
        </div>
      </div>

      <MetricDetailModal
        open={activeMetric !== null}
        onOpenChange={(o) => !o && setActiveMetric(null)}
        metric={activeMetric}
      />
    </>
  )
}

function StatCell({
  metric,
  onClick,
}: {
  metric: { label: string; value: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }>; accent: string }
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-1.5 rounded-lg p-2 text-left transition-colors hover:bg-background/60"
    >
      <span
        className="flex size-7 items-center justify-center rounded-md"
        style={{ background: `${metric.accent}1A`, color: metric.accent }}
      >
        <metric.Icon size={14} strokeWidth={2} />
      </span>
      <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
        {metric.label}
      </p>
      <p className="font-mono font-semibold text-foreground text-sm leading-none">
        {metric.value}
      </p>
    </button>
  )
}
