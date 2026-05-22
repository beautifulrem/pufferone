import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ChevronDown,
  Layers,
  Send,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import { type ComponentType, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CornerBracketCard } from '../components/CornerBracketCard'
import { openTutorial } from '../components/OnboardingModal'
import { ProtocolStatsCard } from '../components/ProtocolStatsCard'
import { ReceiveModal } from '../components/ReceiveModal'
import { SendModal } from '../components/SendModal'
import { Sparkline } from '../components/Sparkline'
import { TokenIcon } from '../components/TokenIcon'
import { useNativeBalance } from '../hooks/useNativeBalance'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
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
      <p className="cyber-eyebrow text-primary">欢迎使用 PufferOne</p>
      <p className="mt-2 text-foreground text-sm leading-relaxed">
        将 ETH 质押为 <span className="font-semibold text-primary">pufETH</span>，
        同时获得以太坊共识奖励与 Puffer 协议收益。
      </p>
      <button
        type="button"
        onClick={openTutorial}
        className="mt-3 inline-flex items-center gap-1 text-primary text-xs hover:underline"
      >
        查看完整介绍 →
      </button>
    </div>
  )
}

function QuickAction({
  label,
  Icon,
  to,
  onClick,
  iconColor,
}: {
  label: string
  Icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  to?: string
  onClick?: () => void
  iconColor?: string
}) {
  const content = (
    <>
      <span
        className="flex size-11 items-center justify-center rounded-full bg-primary/10"
        style={iconColor ? { background: `${iconColor}1A`, color: iconColor } : undefined}
      >
        <Icon size={20} strokeWidth={2} className={iconColor ? '' : 'text-primary'} />
      </span>
      <span className="font-mono text-[11px] text-text-secondary-gray">{label}</span>
    </>
  )
  if (to) {
    return (
      <Link
        to={to}
        className="flex flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-card"
      >
        {content}
      </Link>
    )
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-card"
    >
      {content}
    </button>
  )
}

export function HomePage() {
  const wallet = useWallet()
  const [receiveOpen, setReceiveOpen] = useState(false)
  const [sendOpen, setSendOpen] = useState(false)
  const [showZero, setShowZero] = useState(false)

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

  const heldAssets = assets.filter((a) => a.amount > 0n)
  const zeroAssets = assets.filter((a) => a.amount === 0n)
  const totalUSD = heldAssets.reduce(
    (acc, a) => acc + (Number(a.amount) / 1e18) * a.usdPerUnit,
    0,
  )

  // Sparkline 仅在有真实资产时显示（无误导）
  const sparklineData = useMemo(
    () =>
      totalUSD > 0
        ? APYHistory(wallet.address ?? 'default', totalUSD).map((p) => ({ value: p.value }))
        : [],
    [wallet.address, totalUSD],
  )

  return (
    <div className="space-y-4 pb-6">
      <IntroCard />

      <p className="cyber-eyebrow">PUFFER // 我的资产</p>

      {/* Total Value Card — empty state aware */}
      <CornerBracketCard>
        <div className="space-y-2 p-5">
          {!wallet.isConnected ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <Wallet size={22} className="text-primary" />
              </span>
              <div className="space-y-1">
                <p className="font-semibold text-foreground text-base">还没有连接钱包</p>
                <p className="text-text-tertiary text-xs">连接后即可查看你的实时持仓与收益。</p>
              </div>
              <Button
                onClick={wallet.connectInjected}
                disabled={wallet.isConnecting}
                size="sm"
                className="cta-gradient mt-1 h-9 rounded-full px-5 font-mono text-xs"
              >
                {wallet.isConnecting ? '连接中…' : '连接钱包'}
              </Button>
            </div>
          ) : (
            <>
              <p className="font-mono text-text-tertiary text-xs">总资产估值</p>
              <p className="font-mono font-semibold text-3xl text-foreground">
                ${totalUSD.toFixed(2)}
              </p>
              <p className="font-mono text-text-tertiary text-xs">
                <span className="text-primary">{heldAssets.length}</span> 个持仓 ·{' '}
                <span className="text-text-secondary-gray">Sepolia 测试网</span>
              </p>
              {totalUSD > 0 && (
                <div className="-mb-1 -mx-1 h-10 pt-2">
                  <Sparkline
                    data={sparklineData}
                    color="#FC72FF"
                    colorBottom="#A78BFA"
                    height={40}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </CornerBracketCard>

      {/* Quick Actions — 5 圆形 icon (Phantom 风格) */}
      <div className="grid grid-cols-5 rounded-xl border border-border bg-card/40 py-2">
        <QuickAction label="质押" Icon={TrendingUp} to="/stake" />
        <QuickAction label="金库" Icon={Layers} to="/vaults" iconColor="#A78BFA" />
        <QuickAction label="兑换" Icon={ArrowLeftRight} to="/swap" iconColor="#7DD3FC" />
        <QuickAction
          label="发送"
          Icon={Send}
          iconColor="#FBBF24"
          onClick={() => setSendOpen(true)}
        />
        <QuickAction
          label="收款"
          Icon={ArrowDownToLine}
          iconColor="#4ADE80"
          onClick={() => setReceiveOpen(true)}
        />
      </div>

      {/* Held assets */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <p className="cyber-eyebrow">我的持仓</p>
          {wallet.isConnected && (
            <p className="font-mono text-text-tertiary text-[10px]">
              {heldAssets.length > 0 ? `${heldAssets.length} 个有余额` : '暂无持仓'}
            </p>
          )}
        </div>

        {heldAssets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-5 text-center">
            <p className="text-text-tertiary text-xs leading-relaxed">
              {wallet.isConnected
                ? '你还没有任何 PufferOne 资产，点上面「质押」开始铸造 pufETH。'
                : '连接钱包后会自动显示你在 Sepolia 上的持仓。'}
            </p>
          </div>
        ) : (
          heldAssets.map((a) => <AssetRowItem key={a.symbol} asset={a} active />)
        )}

        {zeroAssets.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setShowZero((v) => !v)}
              className="mt-2 flex w-full items-center justify-between rounded-lg border border-border bg-card/40 px-3 py-2 font-mono text-text-tertiary text-xs hover:border-border-strong hover:text-foreground"
            >
              <span>未持有的资产（{zeroAssets.length}）</span>
              <ChevronDown
                size={14}
                className={`transition-transform ${showZero ? 'rotate-180' : ''}`}
              />
            </button>
            {showZero &&
              zeroAssets.map((a) => <AssetRowItem key={a.symbol} asset={a} active={false} />)}
          </>
        )}
      </div>

      <ProtocolStatsCard />

      <ReceiveModal open={receiveOpen} onOpenChange={setReceiveOpen} />
      <SendModal open={sendOpen} onOpenChange={setSendOpen} />
    </div>
  )
}

function AssetRowItem({ asset: a, active }: { asset: AssetRow; active: boolean }) {
  const usd = (Number(a.amount) / 1e18) * a.usdPerUnit
  return (
    <Link to={a.href} className="block">
      <div
        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
          active
            ? 'border-primary/30 bg-primary/5 hover:border-primary/60'
            : 'border-border bg-card/40 opacity-75 hover:opacity-100'
        }`}
      >
        <TokenIcon symbol={a.symbol} size={36} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-mono font-semibold text-foreground text-sm">{a.symbol}</p>
            {a.badge && active && (
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
            {active ? `≈ $${usd.toFixed(2)}` : '—'}
          </p>
        </div>
      </div>
    </Link>
  )
}
