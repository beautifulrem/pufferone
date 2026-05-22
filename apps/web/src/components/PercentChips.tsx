import { formatUnits } from 'viem'

const PERCENTS = [25, 50, 75, 100] as const

/// PercentChips — 25%/50%/75%/MAX. MetaMask Swap / OKX 都用这个布局。
///
/// `gasReserve` is in wei and is subtracted before computing percentages so
/// users don't accidentally drain ETH to zero (leaving no funds for the next tx).
export function PercentChips({
  balance,
  onPick,
  decimals = 18,
  gasReserve = 0n,
}: {
  balance: bigint
  onPick: (amount: string) => void
  decimals?: number
  gasReserve?: bigint
}) {
  const usable = balance > gasReserve ? balance - gasReserve : 0n
  const isDisabled = usable === 0n

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {PERCENTS.map((p) => {
        const label = p === 100 ? 'MAX' : `${p}%`
        return (
          <button
            key={p}
            type="button"
            disabled={isDisabled}
            onClick={() => {
              const amount = (usable * BigInt(p)) / 100n
              onPick(formatUnits(amount, decimals))
            }}
            className="rounded-md border border-border bg-card/60 py-1.5 font-mono text-text-tertiary text-[11px] uppercase tracking-wider transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
