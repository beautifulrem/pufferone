import { MetricChart } from './MetricChart'

/// VaultAPYChart — 金库 APY 历史折线，封装 MetricChart 让金库存入弹窗
/// 内部继续以 `<VaultAPYChart>` 调用，不破坏现有 import。
export function VaultAPYChart({
  vaultKey,
  baseAPY,
}: {
  vaultKey: string
  baseAPY: number
}) {
  return (
    <div className="space-y-2">
      <p className="font-mono text-text-tertiary text-[10px] uppercase tracking-wider">
        APY 历史
      </p>
      <MetricChart
        seriesKey={vaultKey}
        baseValue={baseAPY}
        formatter={(n) => `${n.toFixed(2)}%`}
      />
    </div>
  )
}
