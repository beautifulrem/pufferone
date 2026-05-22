import { Card, CardContent } from '@repo/ui/components/card'
import { useState } from 'react'

type SafetyMechanism = {
  id: string
  icon: string // emoji ish marker, intentionally minimal
  title: string
  description: string
}

const MECHANISMS: SafetyMechanism[] = [
  {
    id: 'simulate',
    icon: '◇',
    title: 'eth_call 模拟',
    description:
      '钱包签名弹窗打开前，每一笔交易都会通过 publicClient.simulateContract 做静态模拟。模拟出的 revert 原因会以「高风险」级别弹出并阻止广播——遵循 Token UI security/SKILL.md §1.1。',
  },
  {
    id: 'risk',
    icon: '△',
    title: '风险评分',
    description:
      '每个交易页面都会渲染 4 级徽章：信息 / 注意 / 高风险 / 阻断。阻断级别事件（链不对、模拟失败）会直接禁用签名按钮。每张预览卡都会附带风险说明。',
  },
  {
    id: 'minout',
    icon: '◯',
    title: '滑点保护（minOut）',
    description:
      'DEX 兑换和金库存入都在链上强制 minOut——不仅仅是 UI 检查。如果实际输出低于用户设定的滑点容忍度，路由合约和金库合约会直接 revert。',
  },
  {
    id: 'approve',
    icon: '◢',
    title: '精确数额授权',
    description:
      '每次 ERC-20 approve() 调用都使用「正好够本次交易」的数额——绝不 type(uint256).max。授权步骤显示完整数额。无无限授权的快捷通道。',
  },
  {
    id: 'summary',
    icon: '◭',
    title: '签前交易总结',
    description:
      '每次签名前都会有一张总结卡，展示：目标合约（完整地址，不缩写，遵循 SKILL.md §1.2）、输入 / 输出数量、风险徽章、退出提示。你签的是什么，一目了然。',
  },
]

export function SafetyBar() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <Card className="mb-6 border-border bg-card shadow-none">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2px]">
            5 道安全机制 · 题目要求 05 · 点击展开
          </p>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {MECHANISMS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setExpanded((curr) => (curr === m.id ? null : m.id))}
              className={`flex flex-col items-center gap-1 rounded-md border p-2 font-mono text-xs transition-colors ${
                expanded === m.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-text-tertiary hover:border-border-strong hover:text-foreground'
              }`}
            >
              <span className="font-mono text-base text-primary">{m.icon}</span>
              <span className="line-clamp-2 text-center text-[length:var(--text-2xs)] leading-tight">
                {m.title}
              </span>
            </button>
          ))}
        </div>

        {expanded && (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
            <p className="font-mono font-semibold text-foreground text-sm">
              {MECHANISMS.find((m) => m.id === expanded)?.title}
            </p>
            <p className="mt-2 text-sm text-text-secondary-gray leading-relaxed">
              {MECHANISMS.find((m) => m.id === expanded)?.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
