import { useState } from 'react'
import { getTokenIcon } from '../lib/tokenIcons'

export function TokenIcon({ symbol, size = 36 }: { symbol: string; size?: number }) {
  const info = getTokenIcon(symbol)
  const [imgError, setImgError] = useState(false)

  if (info.kind === 'direct' && !imgError) {
    return (
      <img
        src={info.url}
        alt={symbol}
        width={size}
        height={size}
        className="shrink-0 rounded-full"
        onError={() => setImgError(true)}
      />
    )
  }

  if (info.kind === 'gradient' || (info.kind === 'direct' && imgError)) {
    const grad =
      info.kind === 'gradient'
        ? `linear-gradient(135deg, ${info.from}, ${info.to})`
        : 'linear-gradient(135deg, #FF1493, #7C3AED)'
    const label = info.kind === 'gradient' ? info.label : symbol.slice(0, 2)
    return (
      <div
        className="shrink-0 rounded-full font-mono font-semibold text-white"
        style={{
          width: size,
          height: size,
          background: grad,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(10, size * 0.32),
          boxShadow: '0 4px 14px rgba(255, 20, 147, 0.25)',
        }}
      >
        {label}
      </div>
    )
  }

  const fallbackLabel = info.kind === 'fallback' ? info.label : symbol.slice(0, 2).toUpperCase()
  return (
    <div
      className="token-icon-fallback shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.32) }}
    >
      {fallbackLabel}
    </div>
  )
}
