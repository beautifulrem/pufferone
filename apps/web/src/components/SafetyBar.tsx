import { Card, CardContent } from '@repo/ui/components/card'
import { useState } from 'react'

type SafetyMechanism = {
  id: string
  icon: string // emoji ish marker, intentionally minimal
  title: string
  description: string
}

const MECHANISMS: SafetyMechanism[] = [
  {
    id: 'simulate',
    icon: '◇',
    title: 'eth_call Simulation',
    description:
      'Every transaction is statically simulated via publicClient.simulateContract before the wallet sign prompt opens. Simulated revert reasons surface as Danger-level alerts, blocking the broadcast — per Token UI security/SKILL.md §1.1.',
  },
  {
    id: 'risk',
    icon: '△',
    title: 'Risk Score',
    description:
      'Each transactional surface renders a 4-tier badge: Info / Warning / Danger / Block. Block-level events (wrong chain, simulation failed) disable the sign button entirely. Risk text accompanies each preview card.',
  },
  {
    id: 'minout',
    icon: '◯',
    title: 'Slippage Protection (minOut)',
    description:
      'DEX swap and vault deposits enforce minOut on-chain — not just in UI. The router and vault contracts revert if real output falls below the user-set slippage tolerance.',
  },
  {
    id: 'approve',
    icon: '◢',
    title: 'Exact-Amount Approval',
    description:
      'Every ERC-20 approve() call uses the EXACT amount needed — never type(uint256).max. The Approve step shows the exact amount being granted. No infinite allowance shortcuts.',
  },
  {
    id: 'summary',
    icon: '◭',
    title: 'Pre-Sign Tx Summary',
    description:
      'Before every sign action, a summary card shows: target contract (FULL address, not truncated, per SKILL.md §1.2), input/output amounts, risk badge, exit hint. The user knows exactly what they sign.',
  },
]

export function SafetyBar() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <Card className="mb-6 border-border bg-card shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2px]">
            5 Safety Mechanisms · 题目要求 05 · click to expand
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {MECHANISMS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setExpanded((curr) => (curr === m.id ? null : m.id))}
              className={`flex flex-col items-center gap-1 rounded-md border p-2 font-mono text-xs transition-colors ${
                expanded === m.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-tertiary hover:border-border-strong hover:text-foreground'
              }`}
            >
              <span className="font-mono text-base text-primary">{m.icon}</span>
              <span className="line-clamp-2 text-center text-[length:var(--text-2xs)] leading-tight">
                {m.title}
              </span>
            </button>
          ))}
        </div>

        {expanded && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="font-mono font-semibold text-foreground text-sm">
              {MECHANISMS.find((m) => m.id === expanded)?.title}
            </p>
            <p className="mt-2 text-sm text-text-secondary-gray leading-relaxed">
              {MECHANISMS.find((m) => m.id === expanded)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
