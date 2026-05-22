import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import { Flame, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { APYHistory } from '../lib/mockHistory'
import type { VaultDescriptor } from '../lib/vaults'
import { Sparkline } from './Sparkline'
import { TokenIcon } from './TokenIcon'

/// 风险等级 — 套用金融行业「稳健型 / 平衡型 / 进取型」分档（招商银行 R 系列、
/// 支付宝理财、券商基金常用），避免「低 / 中 / 高」过于直白。
const RISK_LABEL: Record<VaultDescriptor['risk'], { variant: 'success' | 'secondary' | 'destructive'; label: string }> =
  {
    Low: { variant: 'success', label: '稳健型' },
    Medium: { variant: 'secondary', label: '平衡型' },
    Elevated: { variant: 'destructive', label: '进取型' },
  }

export type VaultCardProps = {
  vault: VaultDescriptor
  apy?: number
  tvl?: number
  apyLoading?: boolean
  userShares?: bigint
  onDeposit: (vault: VaultDescriptor) => void
}

function formatTVL(tvl: number): string {
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(2)}M`
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`
  return `$${tvl.toFixed(0)}`
}

export function VaultCard({ vault, apy, tvl, apyLoading, userShares, onDeposit }: VaultCardProps) {
  const effectiveAPY = apy ?? vault.fallbackAPY
  const effectiveTVL = tvl ?? vault.fallbackTVL
  const risk = RISK_LABEL[vault.risk]
  const hasShares = userShares !== undefined && userShares > 0n

  const sparklineData = useMemo(
    () => APYHistory(vault.address, effectiveAPY).map((p) => ({ value: p.value })),
    [vault.address, effectiveAPY],
  )

  const isBeginner = vault.highlight === 'beginner'
  const isHot = vault.highlight === 'hot'

  return (
    <Card
      className={`relative border-border bg-card shadow-none transition-colors hover:border-primary/40 ${
        isBeginner ? 'border-primary/40 bg-primary/[0.03]' : ''
      }`}
    >
      <CardContent className="p-4">
        {/* Top row: icon + name + 风险 + highlight badge */}
        <div className="mb-3 flex items-center gap-3">
          <TokenIcon symbol={vault.name} size={36} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-mono font-semibold text-foreground text-base">{vault.name}</p>
              {(isBeginner || isHot) && (
                <span
                  className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] ${
                    isBeginner
                      ? 'bg-primary/15 text-primary'
                      : 'bg-warning/15 text-warning'
                  }`}
                >
                  {isBeginner ? <Sparkles size={9} /> : <Flame size={9} />}
                  {isBeginner ? '新手推荐' : '最热'}
                </span>
              )}
            </div>
            <p className="truncate font-mono text-[10px] text-text-tertiary">{vault.description}</p>
          </div>
          <Badge variant={risk.variant} className="font-mono text-[10px]">
            {risk.label}
          </Badge>
        </div>

        {/* Metrics row: APY + TVL + sparkline */}
        <div className="grid grid-cols-[1fr_1fr_80px] items-center gap-3">
          <div>
            <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wide">APY</p>
            <p className="font-mono font-semibold text-foreground text-lg">
              {apyLoading ? '—' : `${effectiveAPY.toFixed(2)}%`}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wide">TVL</p>
            <p className="font-mono font-semibold text-foreground text-lg">{formatTVL(effectiveTVL)}</p>
          </div>
          <div className="h-10">
            <Sparkline data={sparklineData} />
          </div>
        </div>

        {hasShares && (
          <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-xs">
            <span className="text-text-tertiary">已持有 </span>
            <span className="text-primary">
              {(Number(userShares) / 1e18).toFixed(4)} {vault.name}
            </span>
          </div>
        )}

        <Button
          size="sm"
          variant={hasShares ? 'outline' : 'default'}
          className={`mt-3 w-full font-mono ${!hasShares ? 'cta-gradient' : ''}`}
          onClick={() => onDeposit(vault)}
        >
          {hasShares ? '管理仓位' : `申购 / 赎回`}
        </Button>
      </CardContent>
    </Card>
  )
}
