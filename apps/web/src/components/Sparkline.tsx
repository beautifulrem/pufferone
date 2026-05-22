import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'

type SparklineProps = {
  data: Array<{ value: number }>
  /// 渐变色 — 主色（线 + fill top）
  color?: string
  /// 渐变 fill bottom 颜色（默认透明）
  colorBottom?: string
  height?: number
}

let gradientCount = 0

export function Sparkline({
  data,
  color = '#FF1493',
  colorBottom = '#00E8FF',
  height = 40,
}: SparklineProps) {
  const id = useMemo(() => {
    gradientCount += 1
    return `sparkline-${gradientCount}`
  }, [])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
            <stop offset="100%" stopColor={colorBottom} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${id})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
