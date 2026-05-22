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
    highlight: '复用质押资产，获取叠加收益。',
    body:
      '再质押（Restaking）允许已经质押的 ETH 同时为以太坊共识之外的服务（如 AVS、DA 层等）提供安全保障，从而获得叠加收益，相应地也会承担额外的削减（Slashing）风险。',
  },
  {
    title: '2 · 为什么选择 Puffer Finance？',
    highlight: '验证人友好，流动性强，生态完善。',
    body:
      'Puffer Finance 是以太坊主网上的主流流动再质押协议。其发行的 pufETH 同时承载验证人奖励与流动性属性，可在主流 DeFi 协议中自由使用。',
  },
  {
    title: '3 · pufETH 是你的收益凭证',
    highlight: '1 ETH 约可铸造 0.96 pufETH（主网参考汇率）。',
    body:
      '质押 ETH 后将获得 pufETH 凭证。随着验证人持续累积奖励，pufETH 对 ETH 的赎回比例会逐步上升，这部分增值即为你的收益。本演示在 Sepolia 测试网上采用 0.96 固定模拟汇率。',
  },
  {
    title: '4 · 使用 UniFi 金库放大收益',
    highlight: '四类策略，从稳健型到进取型。',
    body:
      'unifiETH（年化 5%，稳健型）/ unifiUSD（4%，稳健型）/ unifiBTC（5.5%，平衡型）/ pufETHs（7.5%，进取型）。所有金库均以 pufETH 为本金，并以金库份额形式持有，份额价格随收益累积上涨。',
  },
  {
    title: '5 · 签名前的多重保障',
    highlight: '每笔交易自动执行 5 道安全检查。',
    body:
      '在你签名之前，PufferOne 会依次执行：交易模拟、风险分级、滑点保护、精确数额授权、签前摘要展示。所有关键信息都会在签名前完整呈现，由你最终确认。',
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
          <DialogTitle className="text-foreground">
            欢迎使用 PufferOne
          </DialogTitle>
          <p className="mt-1 text-text-tertiary text-xs">
            第 {step + 1} / {STEPS.length} 步 · 可随时跳过
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
