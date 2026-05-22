import { SwapForm } from '../components/SwapForm'

export function SwapPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <p className="cyber-eyebrow">PUFFER // SWAP</p>
        <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">
          任意 → <span className="text-primary">pufETH</span>
        </h1>
        <p className="mt-1.5 text-sm text-text-tertiary leading-relaxed">
          通过 MockSwapRouter 把 stETH / wstETH swap 成 pufETH。滑点链上强制。
        </p>
      </div>
      <SwapForm />
    </div>
  )
}
