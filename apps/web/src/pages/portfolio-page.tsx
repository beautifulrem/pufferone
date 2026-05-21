import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount, truncateAddress } from '../lib/format'
import { VAULTS } from '../lib/vaults'

type Holding = {
  symbol: string
  amount: bigint
  description: string
  /// Approximate USD value per unit (mocked for demo — production uses Puffer
  /// /tokens/prices API endpoint)
  approxUsdPerUnit: number
  href: string
}

function HoldingsCard({ holding }: { holding: Holding }) {
  const hasBalance = holding.amount > 0n
  const usd = (Number(holding.amount) / 1e18) * holding.approxUsdPerUnit

  return (
    <Card
      className={`shadow-none ${hasBalance ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}
    >
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-semibold text-foreground text-base">
            {holding.symbol}
          </h3>
          {hasBalance ? (
            <Badge variant="success" className="font-mono">
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-text-tertiary">
              Empty
            </Badge>
          )}
        </div>

        <div>
          <p className="font-mono font-semibold text-foreground text-xl">
            {formatTokenAmount(holding.amount)}
          </p>
          {hasBalance && (
            <p className="mt-0.5 font-mono text-text-tertiary text-xs">
              ≈ ${usd.toFixed(2)}
            </p>
          )}
        </div>

        <p className="text-sm text-text-tertiary leading-relaxed">{holding.description}</p>

        <Button asChild variant={hasBalance ? 'outline' : 'ghost'} size="sm" className="w-full font-mono">
          <Link to={holding.href}>{hasBalance ? 'Manage' : 'Get started'}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export function PortfolioPage() {
  const wallet = useWallet()

  // Token balances
  const pufETH = useTokenBalance(CONTRACTS.pufETH)
  const stETH = useTokenBalance(CONTRACTS.stETH)
  const wstETH = useTokenBalance(CONTRACTS.wstETH)
  const unifiETH = useTokenBalance(CONTRACTS.unifiETH)
  const unifiUSD = useTokenBalance(CONTRACTS.unifiUSD)
  const unifiBTC = useTokenBalance(CONTRACTS.unifiBTC)
  const pufETHs = useTokenBalance(CONTRACTS.pufETHs)

  const holdings: Holding[] = useMemo(
    () => [
      {
        symbol: 'pufETH',
        amount: pufETH.data ?? 0n,
        description: 'Your liquid Puffer staking position. Earned via /stake or /swap.',
        approxUsdPerUnit: 3_800,
        href: '/stake',
      },
      {
        symbol: 'stETH',
        amount: stETH.data ?? 0n,
        description: 'Mock Lido stETH on Sepolia. Use the /stake faucet to mint test tokens.',
        approxUsdPerUnit: 3_700,
        href: '/stake',
      },
      {
        symbol: 'wstETH',
        amount: wstETH.data ?? 0n,
        description: 'Mock wrapped stETH on Sepolia. Use the /stake faucet to mint test tokens.',
        approxUsdPerUnit: 4_100,
        href: '/stake',
      },
      ...VAULTS.map((v) => ({
        symbol: v.name,
        amount:
          (v.key === 'unifiETH'
            ? unifiETH.data
            : v.key === 'unifiUSD'
              ? unifiUSD.data
              : v.key === 'unifiBTC'
                ? unifiBTC.data
                : pufETHs.data) ?? 0n,
        description: v.description,
        approxUsdPerUnit:
          v.key === 'unifiUSD' ? 1 : v.key === 'unifiBTC' ? 65_000 : 3_800,
        href: '/vaults',
      })),
    ],
    [
      pufETH.data,
      stETH.data,
      wstETH.data,
      unifiETH.data,
      unifiUSD.data,
      unifiBTC.data,
      pufETHs.data,
    ],
  )

  const totalUsd = holdings.reduce(
    (acc, h) => acc + (Number(h.amount) / 1e18) * h.approxUsdPerUnit,
    0,
  )
  const activeCount = holdings.filter((h) => h.amount > 0n).length

  return (
    <>
      <div className="mb-8">
        <p className="mb-3 font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2.5px]">
          Portfolio · 全部 Puffer 位置
        </p>
        <h1 className="mb-4 font-bold text-4xl text-foreground leading-[1.1] tracking-tight">
          Your <span className="identity-gradient">Holdings</span>
        </h1>
        {wallet.isConnected ? (
          <p className="font-mono text-text-tertiary text-sm">
            Wallet:{' '}
            <span className="text-foreground">{truncateAddress(wallet.address ?? undefined)}</span> ·{' '}
            {activeCount} active position{activeCount === 1 ? '' : 's'} · est total ≈ $
            {totalUsd.toFixed(2)}
          </p>
        ) : (
          <p className="font-mono text-warning text-sm">
            Connect your wallet to see your Puffer positions.
          </p>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary/40 bg-primary/5 shadow-none">
          <CardContent className="space-y-2 p-5">
            <p className="font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2px]">
              Total Value
            </p>
            <p className="font-mono font-semibold text-foreground text-3xl">
              ${totalUsd.toFixed(2)}
            </p>
            <p className="font-mono text-text-tertiary text-xs">
              USD estimate · prices mocked for Sepolia demo
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="space-y-2 p-5">
            <p className="font-mono text-[length:var(--text-caption)] text-text-tertiary uppercase tracking-[2px]">
              Active positions
            </p>
            <p className="font-mono font-semibold text-foreground text-3xl">
              {activeCount}/7
            </p>
            <p className="font-mono text-text-tertiary text-xs">
              pufETH + stETH + wstETH + 4 UniFi Vaults
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="space-y-2 p-5">
            <p className="font-mono text-[length:var(--text-caption)] text-text-tertiary uppercase tracking-[2px]">
              Network
            </p>
            <p className="font-mono font-semibold text-foreground text-3xl">Sepolia</p>
            <p className="font-mono text-text-tertiary text-xs">Testnet demo · no real value</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {holdings.map((h) => (
          <HoldingsCard key={h.symbol} holding={h} />
        ))}
      </div>
    </>
  )
}
