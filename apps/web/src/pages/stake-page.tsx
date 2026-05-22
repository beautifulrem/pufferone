import { StakeForm } from '../components/StakeForm'

export function StakePage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <p className="cyber-eyebrow">PUFFER // 质押</p>
        <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">
          铸造 <span className="text-primary">pufETH</span>
        </h1>
        <p className="mt-1.5 text-sm text-text-tertiary leading-relaxed">
          ETH / stETH / wstETH 三个币种均可。Sepolia 真签名，零真实资产风险。
        </p>
      </div>
      <StakeForm />
    </div>
  )
}
