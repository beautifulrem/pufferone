import { HelpCircle, TrendingUp } from 'lucide-react'
import { openTutorial } from '../components/OnboardingModal'
import { StakeForm } from '../components/StakeForm'

/// Mock pufETH staking APY — main-net runs ~3.5% (Beacon Chain + Puffer modules).
/// PufferOne 在 Sepolia 上没有真实收益累积，所以前端给一个稳定参考值。
const STAKING_APY = 3.5

export function StakePage() {
  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="cyber-eyebrow">PUFFER // 质押</p>
          <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">
            将 ETH 质押为 <span className="text-primary">pufETH</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={openTutorial}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-text-tertiary text-[11px] hover:border-primary/40 hover:text-foreground"
        >
          <HelpCircle size={12} />
          查看说明
        </button>
      </div>

      {/* 预期收益卡 */}
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
              {STAKING_APY.toFixed(2)}%
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] text-text-tertiary uppercase tracking-wider">参考汇率</p>
          <p className="font-mono font-semibold text-foreground text-sm">1 ETH → 0.96 pufETH</p>
          <p className="font-mono text-[10px] text-text-tertiary">
            含未来收益增长
          </p>
        </div>
      </div>

      <StakeForm />
    </div>
  )
}
