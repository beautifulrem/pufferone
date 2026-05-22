import { Button } from '@repo/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pufferone:onboarded'

/// 任何组件调用此方法即可重新打开 5 步新手教学
export function openTutorial() {
  window.dispatchEvent(new Event('pufferone:open-tutorial'))
}

type Step = {
  title: string
  body: string
  highlight: string
}

const STEPS: Step[] = [
  {
    title: '1 · 什么是再质押？',
    highlight: '一份 ETH，两份收益。',
    body:
      '再质押（restaking）让你已经质押的 ETH 同时为以太坊共识之外的服务提供安全——多一份收益，也多一层风险。PufferOne 展示用户端体验；底层的验证人经济学跑在以太坊主网上。',
  },
  {
    title: '2 · 为什么选 Puffer？',
    highlight: '对齐验证人、保持流动、可编程。',
    body:
      'Puffer Finance 是以太坊主网领先的流动再质押协议。它的 pufETH 代币就是你工作中的 ETH——一边赚验证人奖励，一边保持流动（可转账、可在 DeFi 中使用）。',
  },
  {
    title: '3 · pufETH = 你的收据',
    highlight: '1 ETH → 约 0.96 pufETH（主网汇率）。',
    body:
      '质押时你会以一个轻微折扣拿到 pufETH。随着验证人持续赚奖励，赎回率（每个 pufETH 兑换的 ETH 数量）会不断增长——这部分增长就是你的收益。PufferOne 在 Sepolia 上使用固定 0.96 模拟汇率。',
  },
  {
    title: '4 · UniFi 金库放大收益',
    highlight: '4 个产品 · 稳健到进取 · 都收 pufETH。',
    body:
      'unifiETH（年化 5%，稳健型）· unifiUSD（4%，稳健型）· unifiBTC（5.5%，平衡型）· pufETHs（7.5%，进取型）。全部接收 pufETH，返还会随时间升值的金库份额。',
  },
  {
    title: '5 · 主控权在你',
    highlight: '每次签名前 5 道安全机制。',
    body:
      'PufferOne 的每一笔交易都会走：eth_call 模拟 → 风险评分 → 链上滑点保护（DEX）→ 精确数额授权（绝不无限）→ 签前显示完整合约地址的总结卡片。你看不见的，绝不签名。',
  },
]

export function OnboardingModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      // 首次访问 — 稍延迟让页面先 paint
      const t = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    // 允许外部按钮通过 custom event 重新触发教学
    const handler = () => {
      setStep(0)
      setOpen(true)
    }
    window.addEventListener('pufferone:open-tutorial', handler)
    return () => window.removeEventListener('pufferone:open-tutorial', handler)
  }, [])

  const handleClose = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true')
    setOpen(false)
    setStep(0)
  }

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]
  if (!current) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">
            欢迎来到 PufferOne
          </DialogTitle>
          <p className="mt-1 font-mono text-text-tertiary text-xs">
            第 {step + 1} / {STEPS.length} 步 · 或直接跳过进入应用
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
            <p className="font-mono font-semibold text-foreground text-base">
              {current.title}
            </p>
            <p className="mt-2 font-mono font-medium text-primary text-sm">
              {current.highlight}
            </p>
            <p className="mt-3 text-sm text-text-secondary-gray leading-relaxed">
              {current.body}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={`step-dot-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable position
                  i
                }`}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-primary' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-text-tertiary"
              onClick={handleClose}
            >
              跳过教程
            </Button>

            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono"
                  onClick={() => setStep((s) => s - 1)}
                >
                  上一步
                </Button>
              )}
              <Button
                size="sm"
                className="font-mono"
                onClick={() => {
                  if (isLast) {
                    handleClose()
                  } else {
                    setStep((s) => s + 1)
                  }
                }}
              >
                {isLast ? '开始使用' : '下一步'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
