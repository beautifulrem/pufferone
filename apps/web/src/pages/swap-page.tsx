import { SwapForm } from '../components/SwapForm'

export function SwapPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <p className="cyber-eyebrow">PUFFER // 闪兑</p>
        <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">
          闪兑 <span className="text-primary">pufETH</span>
        </h1>
        <p className="mt-1 text-text-tertiary text-xs">将稳定币、stETH 等资产快速兑换为 pufETH。</p>
      </div>
      <SwapForm />
    </div>
  )
}
