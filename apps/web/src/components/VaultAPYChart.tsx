import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { mockSeries } from '../lib/mockHistory'

type Timeframe = '1D' | '7D' | '1M' | '1Y'

type Point = { label: string; value: number; tsLabel: string }

const TIMEFRAMES: { key: Timeframe; days: number; tickEvery: number }[] = [
  { key: '1D', days: 24, tickEvery: 6 }, // hourly buckets
  { key: '7D', days: 7, tickEvery: 1 },
  { key: '1M', days: 30, tickEvery: 5 },
  { key: '1Y', days: 12, tickEvery: 1 }, // monthly buckets
]

function makePoints(vaultKey: string, baseAPY: number, tf: Timeframe): Point[] {
  const meta = TIMEFRAMES.find((t) => t.key === tf)
  if (!meta) return []
  const { days } = meta
  const vol = tf === '1D' ? 0.15 : tf === '7D' ? 0.3 : tf === '1M' ? 0.45 : 0.7
  const series = mockSeries(`${vaultKey}:${tf}`, baseAPY, vol, days, 0)
  return series.map((p) => {
    let label: string
    let tsLabel: string
    if (tf === '1D') {
      const hour = (24 - days + p.day) % 24
      label = `${hour.toString().padStart(2, '0')}:00`
      tsLabel = `今天 ${label}`
    } else if (tf === '1Y') {
      label = `${12 - days + p.day + 1}月`
      tsLabel = `${label}`
    } else {
      const ago = days - p.day - 1
      label = ago === 0 ? '今天' : `${ago}天前`
      tsLabel = label
    }
    return { label, value: p.value, tsLabel }
  })
}

type TooltipBag = {
  active?: boolean
  payload?: Array<{ payload?: Point }>
}

function CustomTooltip(props: TooltipBag) {
  if (!props.active || !props.payload?.length) return null
  const entry = props.payload[0]?.payload
  if (!entry) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-text-tertiary text-[10px]">{entry.tsLabel}</p>
      <p className="font-mono font-semibold text-foreground text-sm">
        APY {entry.value.toFixed(2)}%
      </p>
    </div>
  )
}

export function VaultAPYChart({
  vaultKey,
  baseAPY,
}: {
  vaultKey: string
  baseAPY: number
}) {
  const [tf, setTf] = useState<Timeframe>('1M')
  const data = useMemo(() => makePoints(vaultKey, baseAPY, tf), [vaultKey, baseAPY, tf])

  const values = data.map((d) => d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const padding = (max - min) * 0.15 || 0.5
  const yDomain: [number, number] = [Math.max(0, min - padding), max + padding]

  const gradientId = `vault-area-${vaultKey}`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-text-tertiary text-[10px] uppercase tracking-wider">
          APY 历史
        </p>
        <div className="flex gap-1 rounded-full bg-background/60 p-0.5">
          {TIMEFRAMES.map(({ key }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTf(key)}
              className={`rounded-full px-2.5 py-1 font-mono text-[10px] transition-colors ${
                tf === key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-text-tertiary hover:text-foreground'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      <div className="h-44 rounded-lg border border-border bg-background/40 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FC72FF" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="2 4"
              stroke="currentColor"
              className="text-border"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              stroke="currentColor"
              tick={{ fill: 'currentColor', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              className="text-text-tertiary"
              minTickGap={20}
            />
            <YAxis
              domain={yDomain}
              stroke="currentColor"
              tick={{ fill: 'currentColor', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v.toFixed(1)}%`}
              width={42}
              className="text-text-tertiary"
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#FC72FF',
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#FC72FF"
              strokeWidth={1.75}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, stroke: '#FC72FF', strokeWidth: 2, fill: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
