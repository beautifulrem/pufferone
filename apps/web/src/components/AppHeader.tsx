import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { useWallet } from '../hooks/useWallet'
import { truncateAddress } from '../lib/format'
import { CHAIN_ID } from '../lib/viem'
import { InjectedWalletLabel } from '../lib/wallet'

export function AppHeader() {
  const wallet = useWallet()
  const wrongChain = wallet.isConnected && wallet.chainId !== CHAIN_ID

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-border border-b bg-background/80 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div
          className="size-7 rounded-md border border-primary/50"
          style={{
            background: 'linear-gradient(135deg, #ff1493 0%, #c13efe 50%, #00e8ff 100%)',
            boxShadow: '0 0 12px rgba(255, 20, 147, 0.4)',
          }}
        />
        <span className="cyber-eyebrow text-foreground">PufferOne</span>
      </div>

      <div className="flex items-center gap-2">
        {wrongChain ? (
          <Badge variant="destructive" className="font-mono text-xs">
            链错误
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-border-strong font-mono text-text-tertiary text-xs"
          >
            <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-warning" />
            Sepolia
          </Badge>
        )}
        {wallet.isConnected && wallet.address ? (
          <Badge
            variant="outline"
            className="cursor-pointer border-primary/40 bg-primary/5 font-mono text-foreground text-xs hover:border-primary/70"
            onClick={() => navigator.clipboard.writeText(wallet.address ?? '')}
          >
            {truncateAddress(wallet.address)}
          </Badge>
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
