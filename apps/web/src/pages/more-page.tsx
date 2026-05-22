import { Card, CardContent } from '@repo/ui/components/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { BookOpen, ExternalLink, FileCode2, Monitor, Moon, RotateCcw, ShieldCheck, Sun } from 'lucide-react'
import { type ComponentType, useState } from 'react'
import { Link } from 'react-router'
import { ActivityList } from '../components/ActivityList'
import { ImTokenLauncher } from '../components/ImTokenLauncher'
import { openTutorial } from '../components/OnboardingModal'
import { SafetyProtectionsDialog } from '../components/SafetyProtectionsButton'
import { type ThemeMode, useTheme } from '../hooks/useTheme'
import { CONTRACTS } from '../lib/contracts'
import { useWallet } from '../hooks/useWallet'

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
  badge?: { count: number }
}

const LINKS = [
  { href: 'https://github.com/beautifulrem/pufferone', label: 'GitHub 源码' },
  { href: 'https://10th.token.im/#showcase', label: 'imToken 十周年活动' },
] as const

const CONTRACT_LABELS: { key: keyof typeof CONTRACTS; label: string }[] = [
  { key: 'pufETH', label: 'pufETH 代币' },
  { key: 'stETH', label: 'Mock stETH' },
  { key: 'wstETH', label: 'Mock wstETH' },
  { key: 'depositor', label: '质押合约' },
  { key: 'swapRouter', label: '闪兑路由' },
  { key: 'ethUnstake', label: 'ETH 赎回' },
  { key: 'unifiETH', label: 'unifiETH 金库' },
  { key: 'unifiUSD', label: 'unifiUSD 金库' },
  { key: 'unifiBTC', label: 'unifiBTC 金库' },
  { key: 'pufETHs', label: 'pufETHs 金库' },
]

function ItemCard({ item }: { item: Item }) {
  const { icon: Icon, title, description, badge } = item
  const inner = (
    <Card className="relative border-border bg-card shadow-none transition-colors hover:border-primary/40">
      <CardContent className="flex items-start gap-3 p-4">
        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={1.75} />
          {badge && badge.count > 0 && (
            <span className="-top-1.5 -right-1.5 absolute flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-mono font-semibold text-[10px] text-primary-foreground shadow-sm">
              {badge.count}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-foreground text-sm">{title}</p>
            {badge && badge.count > 0 && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] text-primary">
                可赎回
              </span>
            )}
          </div>
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
  const wallet = useWallet()
  const [safetyOpen, setSafetyOpen] = useState(false)
  const [contractsOpen, setContractsOpen] = useState(false)

  const items: Item[] = [
    {
      action: { kind: 'click', onClick: () => setSafetyOpen(true) },
      icon: ShieldCheck,
      title: '交易安全保障',
      description: '了解每次签名前自动执行的 5 道安全检查。',
    },
    {
      action: { kind: 'click', onClick: () => setContractsOpen(true) },
      icon: FileCode2,
      title: 'Sepolia 合约浏览',
      description: '查看本项目部署的全部 10 个测试网合约。',
    },
    {
      action: { kind: 'click', onClick: openTutorial },
      icon: BookOpen,
      title: '查看新手教程',
      description: '通过 5 个步骤了解 PufferOne 的工作机制。',
    },
    {
      action: {
        kind: 'click',
        onClick: () => {
          window.localStorage.removeItem('pufferone:intro-dismissed')
          window.location.href = '/'
        },
      },
      icon: RotateCcw,
      title: '重置引导卡片',
      description: '让资产页顶部的「欢迎使用 PufferOne」介绍卡再次出现。',
    },
  ]

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="font-bold text-2xl text-foreground tracking-tight">更多功能</h1>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <ItemCard key={item.title} item={item} />
        ))}
      </div>

      <SafetyProtectionsDialog open={safetyOpen} onOpenChange={setSafetyOpen} />
      <ContractDialog open={contractsOpen} onOpenChange={setContractsOpen} />

      {/* 最近活动 */}
      <div className="space-y-2 pt-2">
        <p className="cyber-eyebrow">最近活动</p>
        <ActivityList />
      </div>

      {/* imToken deeplink + 二维码 fallback — 已在 imToken 内打开时不显示 */}
      {wallet.injectedKind !== 'imToken' && <ImTokenLauncher />}

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

function ContractDialog({
  open,
  onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">Sepolia 合约浏览</DialogTitle>
          <p className="mt-1 text-text-tertiary text-xs">
            点击任一合约在 Etherscan 查看详情。所有合约均部署在 Sepolia 测试网。
          </p>
        </DialogHeader>
        <div className="space-y-1.5">
          {CONTRACT_LABELS.map(({ key, label }) => (
            <a
              key={key}
              href={`https://sepolia.etherscan.io/address/${CONTRACTS[key]}`}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-2.5 rounded-lg border border-border bg-background/40 px-3 py-2.5 transition-colors hover:border-primary/40"
            >
              <FileCode2 size={14} className="shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-foreground text-xs font-medium">{label}</p>
                <p className="truncate font-mono text-text-tertiary text-[10px]">
                  {CONTRACTS[key]}
                </p>
              </div>
              <ExternalLink size={12} className="shrink-0 text-text-tertiary" />
            </a>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
