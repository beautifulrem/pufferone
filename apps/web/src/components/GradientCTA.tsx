import { cn } from '@repo/ui/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

type GradientCTAProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
}

export function GradientCTA({
  children,
  className,
  loading,
  disabled,
  ...rest
}: GradientCTAProps) {
  return (
    <button
      type="button"
      disabled={loading || disabled}
      className={cn(
        'cta-gradient h-12 w-full rounded-full px-4 font-mono font-semibold text-sm tracking-wide',
        loading && 'animate-pulse',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
