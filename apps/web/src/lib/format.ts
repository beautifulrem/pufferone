import type { Address } from 'viem'
import { formatUnits } from 'viem'

/// Returns "0x1234…ABCD" with the first 6 and last 4 hex chars visible.
/// Use ONLY for compact display — the security skill requires full address
/// on confirmation screens (see TxSummaryCard).
export function truncateAddress(address: Address | string | undefined): string {
  if (!address) return ''
  if (address.length < 12) return address
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

/// Format a wei value with `decimals` precision and a max of `maxFractionDigits`
/// shown after the decimal point. Defaults to 6 fraction digits, balancing
/// readability with precision for ETH-scale numbers.
export function formatTokenAmount(
  value: bigint,
  decimals = 18,
  maxFractionDigits = 6,
): string {
  const raw = formatUnits(value, decimals)
  const dotIndex = raw.indexOf('.')
  if (dotIndex < 0) return raw
  const integer = raw.slice(0, dotIndex)
  const fraction = raw.slice(dotIndex + 1)
  if (maxFractionDigits === 0) return integer
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, '')
  return trimmed.length > 0 ? `${integer}.${trimmed}` : integer
}

/// Pretty-print USD with 2 decimal places.
export function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/// Format a percentage with 2 decimal places.
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`
}
