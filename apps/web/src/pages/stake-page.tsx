import { HelpCircle } from 'lucide-react'
import { openTutorial } from '../components/OnboardingModal'
import { StakeForm } from '../components/StakeForm'

export function StakePage() {
  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="cyber-eyebrow">PUFFER // 质押</p>
          <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">
            把 ETH 换成会增值的 <span className="text-primary">pufETH</span>
          </h1>
        </div>
        <button
          type="button"
          onClick={openTutorial}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-text-tertiary text-[10px] hover:border-primary/40 hover:text-foreground"
        >
          <HelpCircle size={12} />
          这是什么
        </button>
      </div>
      <StakeForm />
    </div>
  )
}
