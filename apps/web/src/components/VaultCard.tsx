import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import type { VaultDescriptor } from '../lib/vaults'

const ACCENT_CLASS: Record<VaultDescriptor['accent'], string> = {
  primary: 'bg-primary',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  ai: 'bg-ai-primary',
}

const RISK_BADGE: Record<VaultDescriptor['risk'], { variant: 'success' | 'secondary' | 'destructive'; label: string }> =
  {
    Low: { variant: 'success', label: 'Low risk' },
    Medium: { variant: 'secondary', label: 'Medium risk' },
    Elevated: { variant: 'destructive', label: 'Elevated risk' },
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
  const risk = RISK_BADGE[vault.risk]
  const hasShares = userShares !== undefined && userShares > 0n

  return (
    <Card className="border-border bg-card shadow-none transition-colors hover:border-primary/40">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`size-2 rounded-full ${ACCENT_CLASS[vault.accent]}`} />
            <h3 className="font-mono font-semibold text-foreground text-lg">{vault.name}</h3>
          </div>
          <Badge variant={risk.variant} className="font-mono">
            {risk.label}
          </Badge>
        </div>

        <p className="text-sm text-text-tertiary leading-relaxed">{vault.description}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-border bg-background/40 p-3">
            <p className="font-mono text-text-tertiary text-xs uppercase tracking-wide">APY</p>
            <p className="mt-1 font-mono font-semibold text-foreground text-lg">
              {apyLoading ? '—' : `${effectiveAPY.toFixed(2)}%`}
            </p>
            <p className="mt-0.5 font-mono text-text-tertiary text-xs">
              {apy !== undefined ? 'mainnet live' : 'fallback estimate'}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background/40 p-3">
            <p className="font-mono text-text-tertiary text-xs uppercase tracking-wide">TVL</p>
            <p className="mt-1 font-mono font-semibold text-foreground text-lg">
              {formatTVL(effectiveTVL)}
            </p>
            <p className="mt-0.5 font-mono text-text-tertiary text-xs">mainnet 30-day avg</p>
          </div>
        </div>

        {hasShares && (
          <div className="rounded-md border border-success/40 bg-success-surface/30 p-3 font-mono text-sm">
            Your shares:{' '}
            <span className="text-success-text">
              {(Number(userShares) / 1e18).toFixed(4)} {vault.name}
            </span>
          </div>
        )}

        <Button
          size="sm"
          variant={hasShares ? 'outline' : 'default'}
          className="w-full font-mono"
          onClick={() => onDeposit(vault)}
        >
          {hasShares ? `Deposit more pufETH` : `Deposit pufETH → ${vault.name}`}
        </Button>
      </CardContent>
    </Card>
  )
}
