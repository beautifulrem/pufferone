import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { truncateAddress } from '../lib/format'
import { InjectedWalletLabel } from '../lib/wallet'

export function WalletConnector() {
  const wallet = useWallet()
  const [copied, setCopied] = useState(false)

  if (wallet.isConnected && wallet.address) {
    return (
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="cursor-pointer gap-2 font-mono text-foreground hover:border-primary/60"
          onClick={async () => {
            await navigator.clipboard.writeText(wallet.address ?? '')
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
          }}
        >
          <span className="size-1.5 rounded-full bg-primary" />
          {copied ? '已复制' : truncateAddress(wallet.address)}
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 font-mono text-text-tertiary text-xs"
          onClick={wallet.disconnect}
        >
          断开
        </Button>
      </div>
    )
  }

  return (
    <Button
      size="sm"
      onClick={wallet.connectInjected}
      disabled={wallet.isConnecting}
      className="font-mono"
    >
      {wallet.isConnecting
        ? '连接中…'
        : `连接 ${InjectedWalletLabel[wallet.injectedKind]}`}
    </Button>
  )
}
