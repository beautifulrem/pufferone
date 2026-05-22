import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { Eye, FileText, Scissors, ShieldCheck, TriangleAlert } from 'lucide-react'
import { useState } from 'react'

const PROTECTIONS = [
  {
    Icon: Eye,
    title: '交易模拟',
    body: '签名前自动在链上预执行该交易；若执行将失败，会立即拦截并提示原因，避免无谓的 gas 消耗。',
  },
  {
    Icon: TriangleAlert,
    title: '风险分级',
    body: '每笔交易均会进行分级标识：信息 / 注意 / 高风险 / 阻断，便于在签名前快速判断。',
  },
  {
    Icon: Scissors,
    title: '精确数额授权',
    body: '每次仅授权本次交易所需的精确数额，避免常见的「无限授权」钓鱼风险。',
  },
  {
    Icon: FileText,
    title: '签前摘要',
    body: '每笔交易在签名前都会以摘要卡呈现关键信息，便于确认无误后再行授权。',
  },
  {
    Icon: ShieldCheck,
    title: '合约地址完整可见',
    body: '始终展示完整的合约地址（不做截断），便于与项目方官方公示的地址进行核对。',
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
          <DialogTitle className="text-foreground">交易安全保障</DialogTitle>
          <p className="mt-1 text-text-tertiary text-xs leading-relaxed">
            每次签名前，PufferOne 会自动执行以下 5 道安全检查。
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
        className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-text-tertiary text-xs transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-primary" />
          已启用 5 项交易安全保障
        </span>
        <span className="text-text-tertiary">›</span>
      </button>
      <SafetyProtectionsDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
