import { Activity, Layers, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useProtocolTVL, useVaultTVLs } from '../hooks/usePufferAPI'
import { VAULTS } from '../lib/vaults'

const FALLBACK_LRT_TVL = 58_900_000 // ~$58.9M (mainnet)
const FALLBACK_PUFETH_APY = 3.5

function formatCompactUSD(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

/// 主网协议规模看板 — cutehamster 在 stake 页底部显示同款数据。
/// totalTVL 和 pufETHStakingAPY 来自 Puffer 主网 API；UniFi TVL 取自
/// `useVaultTVLs` 累加，API 不可用时降级用 VAULTS 的 fallbackTVL。
export function ProtocolStatsCard() {
  const protocol = useProtocolTVL()
  const vaultTVLs = useVaultTVLs()

  const lrtTVL =
    typeof protocol.data?.totalTVL === 'number' && Number.isFinite(protocol.data.totalTVL)
      ? protocol.data.totalTVL
      : FALLBACK_LRT_TVL

  const pufETHAPY =
    typeof protocol.data?.pufETHStakingAPY === 'number' &&
    Number.isFinite(protocol.data.pufETHStakingAPY)
      ? protocol.data.pufETHStakingAPY
      : FALLBACK_PUFETH_APY

  const unifiTVL = useMemo(() => {
    if (Array.isArray(vaultTVLs.data)) {
      const sum = vaultTVLs.data
        .map((e) => (typeof e.tvl === 'number' ? e.tvl : 0))
        .reduce((a, b) => a + b, 0)
      if (sum > 0) return sum
    }
    return VAULTS.reduce((acc, v) => acc + v.fallbackTVL, 0)
  }, [vaultTVLs.data])

  const isLive = !protocol.isError && protocol.isSuccess

  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="cyber-eyebrow">Puffer 协议规模</p>
        <span className="font-mono text-[10px] text-text-tertiary">
          {isLive ? '主网实时' : '离线估算'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCell
          Icon={Activity}
          label="LRT TVL"
          value={formatCompactUSD(lrtTVL)}
          accent="rgb(252 114 255)"
        />
        <StatCell
          Icon={Layers}
          label="UniFi TVL"
          value={formatCompactUSD(unifiTVL)}
          accent="rgb(167 139 250)"
        />
        <StatCell
          Icon={TrendingUp}
          label="pufETH APY"
          value={`${pufETHAPY.toFixed(2)}%`}
          accent="rgb(125 211 252)"
        />
      </div>
    </div>
  )
}

function StatCell({
  Icon,
  label,
  value,
  accent,
}: {
  Icon: typeof Activity
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span
        className="flex size-7 items-center justify-center rounded-md"
        style={{ background: `${accent}1A`, color: accent }}
      >
        <Icon size={14} strokeWidth={2} />
      </span>
      <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">{label}</p>
      <p className="font-mono font-semibold text-foreground text-sm leading-none">{value}</p>
    </div>
  )
}
