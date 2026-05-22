import { cn } from '@repo/ui/lib/utils'
import type { ReactNode } from 'react'

/// Renamed semantically: was CornerBracketCard, kept name for backward-compat
/// imports. Now a simple Uniswap-style card: subtle border + rounded corners,
/// no decorative brackets or glows.
export function CornerBracketCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card', className)}>
      {children}
    </div>
  )
}
