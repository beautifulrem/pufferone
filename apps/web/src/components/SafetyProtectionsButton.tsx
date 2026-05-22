import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { Eye, FileText, Scissors, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

const PROTECTIONS = [
  {
    Icon: Eye,
    title: '交易预演',
    body: '签名前先在链上模拟跑一遍，如果会失败，直接拦住，不让你白付 gas。',
  },
  {
    Icon: TriangleAlert,
    title: '风险等级',
    body: '每笔交易都有清晰的风险标签（信息 / 注意 / 高风险 / 阻断），不让你蒙圈。',
  },
  {
    Icon: Scissors,
    title: '按需授权',
    body: '只授权本次交易需要的金额，不给「无限授权」的常见钓鱼留口子。',
  },
  {
    Icon: FileText,
    title: '签前预览',
    body: '签名前显示一张摘要卡，看清楚了再签。',
  },
  {
    Icon: ShieldCheck,
    title: '合约完整可见',
    body: '展示完整的合约地址，不缩写，方便和官方公布的地址核对。',
  },
] as const

export function SafetyProtectionsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">5 项交易保护</DialogTitle>
          <p className="mt-1 text-text-tertiary text-xs leading-relaxed">
            每次签名前，PufferOne 都会自动跑这 5 道流程，帮你避坑。
          </p>
        </DialogHeader>
        <div className="space-y-3">
          {PROTECTIONS.map(({ Icon, title, body }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-md border border-border bg-background/40 p-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon size={16} strokeWidth={2} />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{title}</p>
                <p className="mt-1 text-text-tertiary text-xs leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SafetyProtectionsButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 font-mono text-text-tertiary text-xs transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-primary" />
          已启用 5 项交易保护
        </span>
        <span className="text-text-tertiary">›</span>
      </button>
      <SafetyProtectionsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
