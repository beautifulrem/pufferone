import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import type { ComponentType } from 'react'
import { MetricChart } from './MetricChart'

export type MetricSpec = {
  /// 缓存键 & 随机种子，例如 'lrt-tvl'
  key: string
  /// 顶部标题
  label: string
  /// 当前格式化值（"$58.90M"）
  value: string
  /// 副标说明
  description: string
  /// 图表基准值（数值，不带单位）
  baseValue: number
  /// 图表 y 轴 / tooltip 值格式化
  formatter: (n: number) => string
  /// 顶部圆形 icon
  Icon: ComponentType<{ size?: number; strokeWidth?: number }>
  /// 折线和图标主色
  accent: string
  /// 是否实时数据
  isLive: boolean
}

export function MetricDetailModal({
  open,
  onOpenChange,
  metric,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  metric: MetricSpec | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto border-border bg-card">
        {metric && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span
                  className="flex size-10 items-center justify-center rounded-lg"
                  style={{ background: `${metric.accent}1A`, color: metric.accent }}
                >
                  <metric.Icon size={20} strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-foreground">{metric.label}</DialogTitle>
                  <p className="mt-0.5 font-mono text-text-tertiary text-xs">
                    {metric.isLive ? '主网实时' : '离线估算'}
                  </p>
                </div>
                <p className="font-mono font-semibold text-foreground text-xl">{metric.value}</p>
              </div>
            </DialogHeader>

            <p className="text-text-tertiary text-xs leading-relaxed">{metric.description}</p>

            <MetricChart
              seriesKey={metric.key}
              baseValue={metric.baseValue}
              formatter={metric.formatter}
              color={metric.accent}
              colorBottom={metric.accent}
              height={220}
            />

            <p className="text-[11px] text-text-tertiary leading-relaxed">
              历史走势为基于当前值生成的估算趋势，仅供参考。完整链上历史请查阅
              Puffer 官方面板或 Etherscan。
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
