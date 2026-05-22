import { Badge } from '@repo/ui/components/badge'
import { Card, CardContent } from '@repo/ui/components/card'
import { Separator } from '@repo/ui/components/separator'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { Address } from 'viem'
import { formatTokenAmount } from '../lib/format'

export type TxSummaryProps = {
  /// e.g. "Stake ETH" / "Approve stETH" / "Deposit to unifiETH"
  action: string
  /// Source amount in human-readable text e.g. "0.1 ETH"
  inputLabel: string
  inputAmount: bigint
  inputSymbol: string
  /// Expected output (after simulation)
  outputLabel: string
  outputAmount: bigint
  outputSymbol: string
  /// Target contract address (shown in full per SKILL.md §1.2)
  contractAddress: Address
  /// "Info" / "Warning" / "Danger" / "Block" — wires up the 5-level risk system
  riskLevel: 'Info' | 'Warning' | 'Danger' | 'Block'
  /// Human risk note (e.g. "Mock contract on Sepolia — testnet demo only")
  riskNote?: string
  /// Exit / withdrawal hint shown to satisfy SKILL.md §3.4 "what comes next"
  exitNote?: string
}

const riskBadge: Record<TxSummaryProps['riskLevel'], { variant: 'success' | 'secondary' | 'destructive'; label: string }> =
  {
    Info: { variant: 'success', label: '信息' },
    Warning: { variant: 'secondary', label: '注意' },
    Danger: { variant: 'destructive', label: '高风险' },
    Block: { variant: 'destructive', label: '阻断' },
  }

/// TxSummaryCard — the canonical "what you're about to sign" preview.
/// Shows: action / target / asset+amount / expected output / risk badge.
/// Address is rendered in FULL per SKILL.md §1.2 — collapsible so non-technical
/// users aren't bothered by it but advanced users can still verify.
export function TxSummaryCard(props: TxSummaryProps) {
  const risk = riskBadge[props.riskLevel]
  const [showAddress, setShowAddress] = useState(false)

  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[length:var(--text-caption)] text-text-tertiary uppercase tracking-[2px]">
            交易预览
          </p>
          <Badge variant={risk.variant} className="font-mono">
            {risk.label}
          </Badge>
        </div>

        <div>
          <p className="font-semibold text-foreground text-lg">{props.action}</p>
          {props.riskNote && (
            <p className="mt-1 text-sm text-text-tertiary">{props.riskNote}</p>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-wide">{props.inputLabel}</p>
            <p className="mt-1 font-mono font-medium text-foreground">
              {formatTokenAmount(props.inputAmount)} {props.inputSymbol}
            </p>
          </div>
          <div>
            <p className="text-text-tertiary text-xs uppercase tracking-wide">{props.outputLabel}</p>
            <p className="mt-1 font-mono font-medium text-primary">
              {formatTokenAmount(props.outputAmount)} {props.outputSymbol}
            </p>
          </div>
        </div>

        {props.exitNote && (
          <>
            <Separator />
            <div>
              <p className="text-text-tertiary text-xs uppercase tracking-wide">想知道之后怎么办？</p>
              <p className="mt-1 text-sm text-text-secondary-gray leading-relaxed">{props.exitNote}</p>
            </div>
          </>
        )}

        <Separator />

        <div>
          <button
            type="button"
            onClick={() => setShowAddress((v) => !v)}
            className="flex w-full items-center justify-between font-mono text-text-tertiary text-xs uppercase tracking-wide hover:text-foreground"
          >
            <span>查看合约地址</span>
            <ChevronDown
              size={12}
              className={`transition-transform ${showAddress ? 'rotate-180' : ''}`}
            />
          </button>
          {showAddress && (
            <p className="mt-2 break-all font-mono text-foreground text-xs">
              {props.contractAddress}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
