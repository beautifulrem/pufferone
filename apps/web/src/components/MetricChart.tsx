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

export type Timeframe = '1D' | '7D' | '1M' | '1Y'

const TIMEFRAMES: { key: Timeframe; days: number }[] = [
  { key: '1D', days: 24 }, // hourly buckets
  { key: '7D', days: 7 },
  { key: '1M', days: 30 },
  { key: '1Y', days: 12 }, // monthly buckets
]

type Point = { label: string; value: number; tsLabel: string }

function makePoints(
  key: string,
  baseValue: number,
  tf: Timeframe,
  volatility?: number,
): Point[] {
  const meta = TIMEFRAMES.find((t) => t.key === tf)
  if (!meta) return []
  const { days } = meta
  // 默认按时间跨度增加波动幅度
  const defaultVol = tf === '1D' ? 0.03 : tf === '7D' ? 0.06 : tf === '1M' ? 0.1 : 0.18
  const vol = (volatility ?? defaultVol) * Math.abs(baseValue || 1)
  const series = mockSeries(`${key}:${tf}`, baseValue, vol, days, 0)
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
  payload?: ReadonlyArray<{ payload?: Point }>
}

function MetricTooltip({
  active,
  payload,
  formatter,
}: TooltipBag & { formatter: (n: number) => string }) {
  if (!active || !payload?.length) return null
  const entry = payload[0]?.payload
  if (!entry) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-text-tertiary text-[10px]">{entry.tsLabel}</p>
      <p className="font-mono font-semibold text-foreground text-sm">
        {formatter(entry.value)}
      </p>
    </div>
  )
}

export type MetricChartProps = {
  /// 用于缓存键 + 随机种子
  seriesKey: string
  /// 基准值（中间线）
  baseValue: number
  /// 自定义波动率（相对值，默认按 tf 计算）
  volatility?: number
  /// y 轴 / tooltip 值格式化
  formatter: (n: number) => string
  /// 图表高度，默认 176px
  height?: number
  /// 主色（line + gradient 顶端），默认主品牌粉
  color?: string
  /// 折线下方 gradient 末端色，默认 ai-primary 紫
  colorBottom?: string
  /// 默认时间段
  defaultTimeframe?: Timeframe
}

export function MetricChart({
  seriesKey,
  baseValue,
  volatility,
  formatter,
  height = 176,
  color = '#FC72FF',
  colorBottom = '#A78BFA',
  defaultTimeframe = '1M',
}: MetricChartProps) {
  const [tf, setTf] = useState<Timeframe>(defaultTimeframe)
  const data = useMemo(
    () => makePoints(seriesKey, baseValue, tf, volatility),
    [seriesKey, baseValue, tf, volatility],
  )

  const values = data.map((d) => d.value)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 0
  const padding = (max - min) * 0.15 || Math.max(0.5, Math.abs(baseValue) * 0.05)
  const yDomain: [number, number] = [Math.max(0, min - padding), max + padding]

  const gradientId = `metric-area-${seriesKey.replace(/[^a-zA-Z0-9]/g, '-')}`

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
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

      <div className="rounded-lg border border-border bg-background/40 p-2" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 8, bottom: 4, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={colorBottom} stopOpacity={0} />
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
              tickFormatter={(v: number) => formatter(v)}
              width={56}
              className="text-text-tertiary"
            />
            <Tooltip
              content={<MetricTooltip formatter={formatter} />}
              cursor={{
                stroke: color,
                strokeWidth: 1,
                strokeDasharray: '3 3',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.75}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: 'white' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
