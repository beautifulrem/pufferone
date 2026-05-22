import { cn } from '@repo/ui/lib/utils'
import type { ReactNode } from 'react'

export function CornerBracketCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'corner-bracket relative rounded-xl border border-border bg-card',
        className,
      )}
    >
      {children}
    </div>
  )
}
