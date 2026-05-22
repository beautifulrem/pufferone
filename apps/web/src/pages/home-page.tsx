import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { ArrowLeftRight, Layers, TrendingUp, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CornerBracketCard } from '../components/CornerBracketCard'
import { openTutorial } from '../components/OnboardingModal'
import { Sparkline } from '../components/Sparkline'
import { TokenIcon } from '../components/TokenIcon'
import { useNativeBalance } from '../hooks/useNativeBalance'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount, truncateAddress } from '../lib/format'
import { APYHistory } from '../lib/mockHistory'
import { VAULTS } from '../lib/vaults'

type AssetRow = {
  symbol: string
  fullName: string
  amount: bigint
  usdPerUnit: number
  href: string
  badge?: string
}

const INTRO_DISMISSED_KEY = 'pufferone:intro-dismissed'

function IntroCard() {
  const [hidden, setHidden] = useState(true)
  useEffect(() => {
    setHidden(window.localStorage.getItem(INTRO_DISMISSED_KEY) === 'true')
  }, [])
  if (hidden) return null
  const dismiss = () => {
    window.localStorage.setItem(INTRO_DISMISSED_KEY, 'true')
    setHidden(true)
  }
  return (
    <div className="relative rounded-xl border border-primary/30 bg-primary/5 p-4">
      <button
        type="button"
        onClick={dismiss}
        aria-label="关闭介绍"
        className="absolute top-2 right-2 rounded-full p-1 text-text-tertiary hover:text-foreground"
      >
        <X size={14} />
      </button>
      <p className="cyber-eyebrow text-primary">欢迎来到 PufferOne</p>
      <p className="mt-2 text-foreground text-sm leading-relaxed">
        把 ETH 存进来变成 <span className="font-semibold text-primary">pufETH</span>，
        一边赚以太坊共识奖励，一边赚 Puffer 收益。
      </p>
      <button
        type="button"
        onClick={openTutorial}
        className="mt-3 inline-flex items-center gap-1 font-mono text-primary text-xs hover:underline"
      >
        了解更多（5 步教学） →
      </button>
    </div>
  )
}

export function HomePage() {
  const wallet = useWallet()

  const eth = useNativeBalance()
  const pufETH = useTokenBalance(CONTRACTS.pufETH)
  const stETH = useTokenBalance(CONTRACTS.stETH)
  const wstETH = useTokenBalance(CONTRACTS.wstETH)
  const unifiETH = useTokenBalance(CONTRACTS.unifiETH)
  const unifiUSD = useTokenBalance(CONTRACTS.unifiUSD)
  const unifiBTC = useTokenBalance(CONTRACTS.unifiBTC)
  const pufETHs = useTokenBalance(CONTRACTS.pufETHs)

  const assets: AssetRow[] = useMemo(
    () => [
      {
        symbol: 'ETH',
        fullName: 'Sepolia 原生 ETH',
        amount: eth.data ?? 0n,
        usdPerUnit: 3_800,
        href: '/stake',
      },
      {
        symbol: 'pufETH',
        fullName: 'PufferOne Mock pufETH',
        amount: pufETH.data ?? 0n,
        usdPerUnit: 3_950,
        href: '/stake',
        badge: '可质押',
      },
      {
        symbol: 'stETH',
        fullName: 'Mock Lido stETH',
        amount: stETH.data ?? 0n,
        usdPerUnit: 3_790,
        href: '/stake',
      },
      {
        symbol: 'wstETH',
        fullName: 'Mock Wrapped stETH',
        amount: wstETH.data ?? 0n,
        usdPerUnit: 4_180,
        href: '/stake',
      },
      ...VAULTS.map((v) => ({
        symbol: v.name,
        fullName: v.description,
        amount:
          (v.key === 'unifiETH'
            ? unifiETH.data
            : v.key === 'unifiUSD'
              ? unifiUSD.data
              : v.key === 'unifiBTC'
                ? unifiBTC.data
                : pufETHs.data) ?? 0n,
        usdPerUnit:
          v.key === 'unifiUSD' ? 1 : v.key === 'unifiBTC' ? 65_000 : 3_800,
        href: '/vaults',
        badge: `${v.fallbackAPY.toFixed(1)}% APY`,
      })),
    ],
    [
      eth.data,
      pufETH.data,
      stETH.data,
      wstETH.data,
      unifiETH.data,
      unifiUSD.data,
      unifiBTC.data,
      pufETHs.data,
    ],
  )

  const totalUSD = assets.reduce(
    (acc, a) => acc + (Number(a.amount) / 1e18) * a.usdPerUnit,
    0,
  )
  const activeCount = assets.filter((a) => a.amount > 0n).length

  // Sparkline mock data (total portfolio value over 30 days)
  const sparklineData = useMemo(
    () => APYHistory(wallet.address ?? 'default', totalUSD || 100).map((p) => ({ value: p.value })),
    [wallet.address, totalUSD],
  )

  return (
    <div className="space-y-4 pb-6">
      <IntroCard />

      {/* Eyebrow */}
      <p className="cyber-eyebrow">PUFFER // 我的资产</p>

      {/* Total Value Card */}
      <CornerBracketCard>
        <div className="space-y-2 p-5">
          <p className="font-mono text-text-tertiary text-xs">总资产估值</p>
          <p className="font-mono font-semibold text-3xl text-foreground">
            <span className="text-foreground">${totalUSD.toFixed(2)}</span>
          </p>
          {wallet.isConnected ? (
            <p className="font-mono text-text-tertiary text-xs">
              {truncateAddress(wallet.address ?? undefined)} ·{' '}
              <span className="text-primary">{activeCount}</span> 个活跃仓位
            </p>
          ) : (
            <p className="font-mono text-warning text-xs">连接钱包查看你的实际仓位</p>
          )}
          <div className="-mb-1 -mx-1 h-10 pt-2">
            <Sparkline data={sparklineData} color="#FC72FF" colorBottom="#A78BFA" height={40} />
          </div>
        </div>
      </CornerBracketCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Button asChild variant="outline" className="h-16 flex-col gap-1 border-border bg-card font-mono text-xs">
          <Link to="/stake">
            <TrendingUp size={18} className="text-primary" />
            <span>质押</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-16 flex-col gap-1 border-border bg-card font-mono text-xs">
          <Link to="/vaults">
            <Layers size={18} style={{ color: 'var(--ai-primary)' }} />
            <span>金库</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-16 flex-col gap-1 border-border bg-card font-mono text-xs">
          <Link to="/swap">
            <ArrowLeftRight size={18} style={{ color: 'var(--brand-secondary)' }} />
            <span>兑换</span>
          </Link>
        </Button>
      </div>

      {/* Assets List */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <p className="cyber-eyebrow">持仓列表</p>
          <p className="font-mono text-text-tertiary text-[10px]">链 · Sepolia</p>
        </div>

        {assets.map((a) => {
          const hasBalance = a.amount > 0n
          const usd = (Number(a.amount) / 1e18) * a.usdPerUnit
          return (
            <Link key={a.symbol} to={a.href} className="block">
              <div
                className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                  hasBalance
                    ? 'border-primary/30 bg-primary/5 hover:border-primary/60'
                    : 'border-border bg-card hover:border-border-strong'
                }`}
              >
                <TokenIcon symbol={a.symbol} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono font-semibold text-foreground text-sm">{a.symbol}</p>
                    {a.badge && hasBalance && (
                      <Badge variant="outline" className="border-primary/40 font-mono text-[10px] text-primary">
                        {a.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate font-mono text-[10px] text-text-tertiary">{a.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-foreground text-sm">
                    {formatTokenAmount(a.amount, 18, 4)}
                  </p>
                  <p className="font-mono text-[10px] text-text-tertiary">
                    {hasBalance ? `≈ $${usd.toFixed(2)}` : '—'}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
