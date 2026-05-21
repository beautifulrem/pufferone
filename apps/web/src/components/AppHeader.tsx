import { Badge } from '@repo/ui/components/badge'
import { useWallet } from '../hooks/useWallet'
import { CHAIN_ID } from '../lib/viem'
import { WalletConnector } from './WalletConnector'

export function AppHeader() {
  const wallet = useWallet()
  const isWrongChain = wallet.isConnected && wallet.chainId !== CHAIN_ID

  return (
    <header className="mb-12 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className="size-8 rounded-md border border-primary/40"
          style={{
            background: 'linear-gradient(135deg, rgb(0 229 199) 0%, rgb(0 168 145) 100%)',
          }}
        />
        <span className="font-mono font-semibold text-base text-foreground tracking-tight">
          PufferOne
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isWrongChain ? (
          <Badge variant="destructive" className="font-mono">
            <span className="mr-1.5 size-1.5 rounded-full bg-destructive-foreground" />
            Wrong Network
          </Badge>
        ) : (
          <Badge variant="outline" className="font-mono text-text-tertiary">
            <span className="mr-1.5 size-1.5 animate-pulse rounded-full bg-warning" />
            Sepolia Testnet
          </Badge>
        )}
        <WalletConnector />
      </div>
    </header>
  )
}
