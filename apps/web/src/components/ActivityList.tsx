import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Layers, Send, TrendingUp } from 'lucide-react'
import type { ComponentType } from 'react'
import { type ActivityEntry, useActivityLog } from '../hooks/useActivityLog'

const TYPE_ICON: Record<ActivityEntry['type'], ComponentType<{ size?: number }>> = {
  stake: TrendingUp,
  unstake: ArrowDownLeft,
  swap: ArrowLeftRight,
  'vault-deposit': Layers,
  'vault-withdraw': ArrowUpRight,
  transfer: Send,
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  return `${Math.floor(diff / 86_400_000)} 天前`
}

export function ActivityList() {
  const { entries, clear } = useActivityLog()

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/40 p-5 text-center">
        <p className="text-text-tertiary text-xs leading-relaxed">
          完成质押 / 闪兑 / 申购等操作后会在这里看到最近 10 笔记录。
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const Icon = TYPE_ICON[entry.type]
        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground text-sm">{entry.label}</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${entry.txHash}`}
                target="_blank"
                rel="noreferrer noopener"
                className="font-mono text-text-tertiary text-[10px] hover:text-primary"
              >
                {entry.txHash.slice(0, 10)}…{entry.txHash.slice(-6)}
              </a>
            </div>
            <span className="shrink-0 font-mono text-text-tertiary text-[10px]">
              {timeAgo(entry.ts)}
            </span>
          </div>
        )
      })}
      <button
        type="button"
        onClick={clear}
        className="mt-1 w-full text-center font-mono text-text-tertiary text-[10px] hover:text-foreground"
      >
        清空记录
      </button>
    </div>
  )
}
