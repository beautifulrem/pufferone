import { ArrowDownLeft, HelpCircle, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { openTutorial } from '../components/OnboardingModal'
import { StakeForm } from '../components/StakeForm'
import { useProtocolTVL, usePufETHRate } from '../hooks/usePufferAPI'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'

const FALLBACK_APY = 2.64
const FALLBACK_RATE = 0.9298

type Direction = 'stake' | 'unstake'

export function StakePage() {
  const [direction, setDirection] = useState<Direction>('stake')
  const rate = usePufETHRate()
  const protocol = useProtocolTVL()
  const pufETHBalance = useTokenBalance(CONTRACTS.pufETH)

  const liveRate = rate.data?.pufEthPerEth
    ? Number.parseFloat(rate.data.pufEthPerEth)
    : null
  const displayRate = Number.isFinite(liveRate) && liveRate ? liveRate : FALLBACK_RATE
  const rateSource: 'live' | 'fallback' = liveRate !== null && Number.isFinite(liveRate)
    ? 'live'
    : 'fallback'

  const liveAPY = protocol.data?.pufETHStakingAPY
  const displayAPY =
    typeof liveAPY === 'number' && Number.isFinite(liveAPY) ? liveAPY : FALLBACK_APY

  const balance = pufETHBalance.data ?? 0n

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-bold text-2xl text-foreground tracking-tight">
          质押 <span className="text-primary">/ 赎回</span>
        </h1>
        <button
          type="button"
          onClick={openTutorial}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-text-tertiary text-[11px] hover:border-primary/40 hover:text-foreground"
          aria-label="查看说明"
        >
          <HelpCircle size={12} />
          查看说明
        </button>
      </div>

      {/* 顶部信息卡 — 跟随 direction 切换 */}
      {direction === 'stake' ? (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15">
              <TrendingUp size={18} className="text-primary" />
            </span>
            <div>
              <p className="font-mono text-text-tertiary text-[10px] uppercase tracking-wider">
                预期年化收益
              </p>
              <p className="font-mono font-bold text-2xl text-foreground leading-none">
                {displayAPY.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
              {rateSource === 'live' ? '主网实时汇率' : '参考汇率'}
            </p>
            <p className="font-mono font-semibold text-foreground text-sm">
              1 ETH → {displayRate.toFixed(4)} pufETH
            </p>
            <p className="font-mono text-[10px] text-text-tertiary">
              {rateSource === 'live' ? '来自 Puffer 主网' : '离线估算'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15">
              <ArrowDownLeft size={18} className="text-primary" />
            </span>
            <div>
              <p className="font-mono text-text-tertiary text-[10px] uppercase tracking-wider">
                可赎回 pufETH
              </p>
              <p className="font-mono font-bold text-2xl text-foreground leading-none">
                {formatTokenAmount(balance, 18, 4)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">
              反向汇率
            </p>
            <p className="font-mono font-semibold text-foreground text-sm">
              1 pufETH ≈ 1.04 ETH
            </p>
            <p className="font-mono text-[10px] text-text-tertiary">含已累积收益</p>
          </div>
        </div>
      )}

      <StakeForm direction={direction} onDirectionChange={setDirection} />
    </div>
  )
}
