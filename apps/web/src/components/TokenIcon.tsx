import { useState } from 'react'
import { getTokenSource, type TokenSource } from '../lib/tokenIcons'

/// Renders a token icon with multi-source fallback chain:
/// 1. Try each URL in `urls` (Trust Wallet → Spothq → ...).
/// 2. If all fail, render an inline SVG gradient circle with letter glyph.
/// 3. Wrapped vault tokens render their base + a dashed ring overlay.

function GradientCircle({
  size,
  from,
  to,
  label,
}: {
  size: number
  from: string
  to: string
  label: string
}) {
  return (
    <div
      className="shrink-0 rounded-full font-mono font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(9, Math.min(14, size * 0.34)),
      }}
    >
      {label}
    </div>
  )
}

function UrlIcon({
  urls,
  symbol,
  size,
}: {
  urls: readonly string[]
  symbol: string
  size: number
}) {
  const [index, setIndex] = useState(0)

  if (index >= urls.length) {
    // All URLs exhausted → fall back to gradient circle.
    return (
      <GradientCircle
        size={size}
        from="#FC72FF"
        to="#A78BFA"
        label={symbol.slice(0, 2).toUpperCase()}
      />
    )
  }

  const url = urls[index]
  if (!url) {
    return null
  }
  return (
    <img
      src={url}
      alt={symbol}
      width={size}
      height={size}
      className="shrink-0 rounded-full"
      onError={() => setIndex((i) => i + 1)}
    />
  )
}

function WrappedIcon({
  base,
  ringColor,
  label,
  size,
}: {
  base: TokenSource
  ringColor: string
  label: string
  size: number
}) {
  // 12% smaller inner icon, with a dashed ring overlay around it.
  const innerSize = Math.round(size * 0.78)
  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{ width: size, height: size }}
      aria-label={label}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1.5px dashed ${ringColor}`,
          opacity: 0.85,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <RenderSource source={base} size={innerSize} />
      </div>
    </div>
  )
}

function RenderSource({ source, size }: { source: TokenSource; size: number }) {
  if (source.kind === 'urls') {
    return <UrlIcon urls={source.urls} symbol={source.symbol} size={size} />
  }
  if (source.kind === 'gradient') {
    return <GradientCircle size={size} from={source.from} to={source.to} label={source.label} />
  }
  // wrapped
  return (
    <WrappedIcon base={source.base} ringColor={source.ringColor} label={source.label} size={size} />
  )
}

export function TokenIcon({ symbol, size = 36 }: { symbol: string; size?: number }) {
  const source = getTokenSource(symbol)
  return <RenderSource source={source} size={size} />
}
