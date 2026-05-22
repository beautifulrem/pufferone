import { SwapForm } from '../components/SwapForm'

export function SwapPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="font-bold text-2xl text-foreground tracking-tight">
          闪兑 <span className="text-primary">pufETH</span>
        </h1>
        <p className="mt-1 text-text-tertiary text-xs">LST 与 pufETH 双向快速兑换，支持链上滑点保护。</p>
      </div>
      <SwapForm />
    </div>
  )
}
