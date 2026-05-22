import { AlertTriangle } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { CHAIN_ID } from '../lib/viem'

export function NetworkGuard() {
  const wallet = useWallet()
  if (!wallet.isConnected || wallet.chainId === CHAIN_ID) return null

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/5 p-3">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-destructive text-xs">网络不匹配</p>
        <p className="mt-0.5 text-text-tertiary text-[11px] leading-relaxed">
          当前链 ID {wallet.chainId ?? '—'}，需切换到 Sepolia（{CHAIN_ID}）才能操作。
        </p>
        <button
          type="button"
          onClick={wallet.switchToSepolia}
          className="mt-2 rounded-lg bg-destructive px-3 py-1.5 font-mono text-white text-xs transition-colors hover:bg-destructive/90"
        >
          切换到 Sepolia
        </button>
      </div>
    </div>
  )
}
