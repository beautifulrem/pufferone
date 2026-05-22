import { Card, CardContent } from '@repo/ui/components/card'
import {
  ArrowDownToLine,
  BookOpen,
  ExternalLink,
  Monitor,
  Moon,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { type ComponentType, useState } from 'react'
import { Link } from 'react-router'
import { openTutorial } from '../components/OnboardingModal'
import { SafetyProtectionsDialog } from '../components/SafetyProtectionsButton'
import { type ThemeMode, useTheme } from '../hooks/useTheme'

const THEME_OPTIONS: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: '系统', Icon: Monitor },
  { value: 'light', label: '亮色', Icon: Sun },
  { value: 'dark', label: '暗色', Icon: Moon },
]

function ThemeSwitcher() {
  const { mode, setMode } = useTheme()
  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="p-4">
        <p className="cyber-eyebrow">主题</p>
        <p className="mt-1 mb-3 text-text-tertiary text-xs leading-relaxed">
          跟随系统、强制亮色或暗色。设置会本地保存。
        </p>
        <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-background p-1">
          {THEME_OPTIONS.map(({ value, label, Icon }) => {
            const active = mode === value
            return (
              <button
                type="button"
                key={value}
                onClick={() => setMode(value)}
                className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-text-tertiary hover:text-foreground'
                }`}
                aria-pressed={active}
              >
                <Icon size={14} strokeWidth={2} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

type ItemAction =
  | { kind: 'link'; href: string }
  | { kind: 'click'; onClick: () => void }

type Item = {
  action: ItemAction
  icon: ComponentType<{ size?: number; strokeWidth?: number }>
  title: string
  description: string
}

const LINKS = [
  { href: 'https://github.com/beautifulrem/pufferone', label: 'GitHub 源码' },
  { href: 'https://sepolia.etherscan.io/address/0x8628C68227EAfe1B435eb3F918e5358aE5b1c390', label: 'Sepolia 合约浏览' },
  { href: 'https://10th.token.im/#showcase', label: 'imToken 十周年活动' },
] as const

function ItemCard({ item }: { item: Item }) {
  const { icon: Icon, title, description } = item
  const inner = (
    <Card className="border-border bg-card shadow-none transition-colors hover:border-primary/40">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-foreground text-sm">{title}</p>
          <p className="mt-0.5 text-text-tertiary text-xs leading-relaxed">{description}</p>
        </div>
        <span className="text-text-tertiary">›</span>
      </CardContent>
    </Card>
  )
  if (item.action.kind === 'link') {
    return (
      <Link to={item.action.href} className="block">
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={item.action.onClick} className="block w-full">
      {inner}
    </button>
  )
}

export function MorePage() {
  const [safetyOpen, setSafetyOpen] = useState(false)

  const items: Item[] = [
    {
      action: { kind: 'link', href: '/exit' },
      icon: ArrowDownToLine,
      title: '赎回与退出',
      description: '把 pufETH 换回 ETH，或者从金库取回。',
    },
    {
      action: { kind: 'click', onClick: () => setSafetyOpen(true) },
      icon: ShieldCheck,
      title: '5 项交易保护',
      description: '每次签名前自动跑的 5 道防护，点开看说明。',
    },
    {
      action: { kind: 'click', onClick: openTutorial },
      icon: BookOpen,
      title: '重看新手教学',
      description: '5 步带你了解 PufferOne 在做什么。',
    },
  ]

  return (
    <div className="space-y-4 pb-6">
      <div>
        <p className="cyber-eyebrow">PUFFER // 更多</p>
        <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">更多功能</h1>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <ItemCard key={item.title} item={item} />
        ))}
      </div>

      <SafetyProtectionsDialog open={safetyOpen} onOpenChange={setSafetyOpen} />

      <ThemeSwitcher />

      <div className="space-y-2 pt-2">
        <p className="cyber-eyebrow">外部链接</p>
        {LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 font-mono text-foreground text-sm transition-colors hover:border-primary/40"
          >
            <span>{label}</span>
            <ExternalLink size={14} className="text-text-tertiary" />
          </a>
        ))}
      </div>

      <Card className="border-border bg-card shadow-none">
        <CardContent className="p-4">
          <p className="cyber-eyebrow">关于</p>
          <p className="mt-2 font-bold text-foreground text-lg">PufferOne</p>
          <p className="mt-2 text-text-tertiary text-xs leading-relaxed">
            让普通用户也能轻松用上 Puffer 再质押。当前演示运行在 Sepolia 测试网，不涉及主网资金。
          </p>
          <p className="mt-3 cyber-eyebrow text-text-tertiary">v0.1.0 · 2026-05-22</p>
        </CardContent>
      </Card>
    </div>
  )
}
