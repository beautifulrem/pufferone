import { SwapForm } from '../components/SwapForm'

export function SwapPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <p className="cyber-eyebrow">PUFFER // 兑换</p>
        <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">
          手里其他币 → <span className="text-primary">pufETH</span>
        </h1>
      </div>
      <SwapForm />
    </div>
  )
}
