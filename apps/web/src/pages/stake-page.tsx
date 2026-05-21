import { StakeForm } from '../components/StakeForm'

export function StakePage() {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <p className="mb-3 font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2.5px]">
          题目要求 02 · 3 币种铸造 pufETH
        </p>
        <h1 className="mb-4 font-bold text-4xl text-foreground leading-[1.1] tracking-tight">
          Mint <span className="identity-gradient">pufETH</span>
        </h1>
        <p className="mb-6 text-text-secondary-gray leading-relaxed">
          Phase 3 starts with the ETH path — the most direct way to bootstrap a pufETH
          balance. Subsequent phases add stETH (Phase 4) and wstETH (Phase 4) inputs,
          plus an arbitrary-token DEX route (Phase 6).
        </p>

        <ul className="space-y-3 font-mono text-sm text-text-tertiary">
          <li>
            <span className="text-primary">→</span> Connect wallet → sign one tx
          </li>
          <li>
            <span className="text-primary">→</span> Static simulation before every sign
          </li>
          <li>
            <span className="text-primary">→</span> Exact amounts, no infinite approvals
          </li>
          <li>
            <span className="text-primary">→</span> Sepolia mock contract — no real assets
          </li>
        </ul>
      </div>

      <StakeForm />
    </div>
  )
}
