import { ArrowLeftRight, Layers, MoreHorizontal, TrendingUp, Wallet } from 'lucide-react'
import type { ComponentType } from 'react'
import { NavLink } from 'react-router'

type Tab = {
  path: string
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
}

const TABS: readonly Tab[] = [
  { path: '/', label: '资产', icon: Wallet },
  { path: '/stake', label: '质押', icon: TrendingUp },
  { path: '/vaults', label: '金库', icon: Layers },
  { path: '/swap', label: '兑换', icon: ArrowLeftRight },
  { path: '/more', label: '更多', icon: MoreHorizontal },
] as const

export function BottomTabNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[460px] -translate-x-1/2 border-t border-border bg-card/90 backdrop-blur-xl"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `tab-link relative flex flex-col items-center justify-center gap-1 py-2 font-mono text-[10px] tracking-wider transition-colors ${
                  isActive
                    ? 'tab-active text-primary'
                    : 'text-text-tertiary hover:text-foreground'
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              <span className="leading-none">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
