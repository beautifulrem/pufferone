import { SwapForm } from '../components/SwapForm'

export function SwapPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="font-bold text-2xl text-foreground tracking-tight">
          闪兑 <span className="text-primary">pufETH</span>
        </h1>
        <p className="mt-1 text-text-tertiary text-xs">将 stETH / wstETH 等 LST 资产快速兑换为 pufETH。</p>
      </div>
      <SwapForm />
    </div>
  )
}
