import { Badge } from '@repo/ui/components/badge'

export function RoutePath({ tokens }: { tokens: readonly string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tokens.map((token, i) => (
        <span key={`${token}-${i}`} className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-foreground">
            {token}
          </Badge>
          {i < tokens.length - 1 && (
            <span className="font-mono text-primary text-sm" aria-hidden>
              →
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
