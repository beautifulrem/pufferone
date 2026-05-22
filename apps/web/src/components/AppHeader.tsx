import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Copy, LogOut } from 'lucide-react'
import { useRef, useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { truncateAddress } from '../lib/format'
import { CHAIN_ID } from '../lib/viem'
import { InjectedWalletLabel } from '../lib/wallet'
import { AddressAvatar } from './AddressAvatar'
import { PufferOneLogo } from './PufferOneLogo'

export function AppHeader() {
  const wallet = useWallet()
  const wrongChain = wallet.isConnected && wallet.chainId !== CHAIN_ID

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-border border-b bg-background/80 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <PufferOneLogo size={28} />
        <span className="font-mono font-semibold text-foreground text-sm tracking-tight">
          PufferOne
        </span>
        {wallet.injectedKind === 'imToken' && (
          <span
            className="ml-1 rounded-full px-1.5 py-0.5 font-mono text-[9px]"
            style={{
              background: 'rgba(56, 152, 252, 0.12)',
              color: 'rgb(56, 152, 252)',
            }}
            title="已在 imToken 钱包内打开"
          >
            imToken 内置
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {wrongChain ? (
          <Badge variant="destructive" className="font-mono text-xs">
            链错误
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="font-mono text-xs"
            style={{
              borderColor: 'rgba(167, 139, 250, 0.4)',
              background: 'rgba(167, 139, 250, 0.1)',
              color: 'rgb(167 139 250)',
            }}
          >
            <span
              className="mr-1.5 size-1.5 animate-pulse rounded-full"
              style={{ background: 'rgb(167 139 250)' }}
            />
            Sepolia 测试网
          </Badge>
        )}
        {wallet.isConnected && wallet.address ? (
          <AddressDropdown address={wallet.address} onDisconnect={wallet.disconnect} />
        ) : (
          <Button
            size="sm"
            className="cta-gradient h-7 rounded-full px-3 font-mono text-xs"
            onClick={wallet.connectInjected}
            disabled={wallet.isConnecting}
          >
            {wallet.isConnecting ? '连接中…' : `连接 ${InjectedWalletLabel[wallet.injectedKind]}`}
          </Button>
        )}
      </div>
    </header>
  )
}

function AddressDropdown({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative" ref={ref}>
      <Badge
        variant="outline"
        className="cursor-pointer gap-1.5 border-primary/40 bg-primary/5 font-mono text-foreground text-xs hover:border-primary/70"
        onClick={() => setOpen((v) => !v)}
      >
        <AddressAvatar address={address} size={14} />
        {truncateAddress(address)}
      </Badge>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <div className="border-border border-b px-3 py-2.5">
              <p className="font-mono text-text-tertiary text-[10px]">已连接地址</p>
              <p className="mt-0.5 break-all font-mono text-foreground text-[11px] leading-relaxed">
                {address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { handleCopy(); }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-foreground text-xs transition-colors hover:bg-background/60"
            >
              <Copy size={14} className="text-text-tertiary" />
              {copied ? '已复制' : '复制地址'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onDisconnect(); }}
              className="flex w-full items-center gap-2 border-border border-t px-3 py-2.5 text-destructive text-xs transition-colors hover:bg-destructive/5"
            >
              <LogOut size={14} />
              断开连接
            </button>
          </div>
        </>
      )}
    </div>
  )
}
