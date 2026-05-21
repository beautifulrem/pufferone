import { Alert, AlertDescription, AlertTitle } from '@repo/ui/components/alert'
import { Button } from '@repo/ui/components/button'
import { useWallet } from '../hooks/useWallet'
import { CHAIN_ID } from '../lib/viem'

/// Banner shown when the user is connected to a wallet but on the wrong chain.
/// Per security/SKILL.md §2.2 — this is a Block-level risk: every transactional
/// action must be disabled while this banner is up.
export function NetworkGuard() {
  const wallet = useWallet()
  if (!wallet.isConnected || wallet.chainId === CHAIN_ID) return null

  return (
    <Alert variant="destructive" className="mb-6 border-destructive/50 bg-error-surface">
      <AlertTitle className="font-mono">Network Mismatch · Block Level Risk</AlertTitle>
      <AlertDescription className="font-mono text-text-secondary-gray">
        <p className="mb-3">
          You are connected to chain {wallet.chainId ?? '—'}. PufferOne demo runs only on
          Sepolia ({CHAIN_ID}). All transactional actions are disabled until you switch.
        </p>
        <Button size="sm" onClick={wallet.switchToSepolia} className="font-mono">
          Switch to Sepolia
        </Button>
      </AlertDescription>
    </Alert>
  )
}
