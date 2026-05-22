import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { CHAIN_ID } from '../lib/viem'

export function NetworkGuard() {
  const wallet = useWallet()
  const [switching, setSwitching] = useState(false)
  const [error, setError] = useState('')

  if (!wallet.isConnected || wallet.chainId === CHAIN_ID) return null

  const handleSwitch = async () => {
    setSwitching(true)
    setError('')
    try {
      await wallet.switchToSepolia()
    } catch {
      setError('切换失败，请在钱包中手动切换到 Sepolia 网络')
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-destructive/40 bg-destructive/5 p-3">
      <AlertTriangle size={16} className="mt-0.5 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-destructive text-xs">网络不匹配</p>
        <p className="mt-0.5 text-text-tertiary text-[11px] leading-relaxed">
          当前链 ID {wallet.chainId ?? '—'}，需切换到 Sepolia（{CHAIN_ID}）才能操作。
        </p>
        {error && (
          <p className="mt-1 text-destructive text-[11px]">{error}</p>
        )}
        <button
          type="button"
          onClick={handleSwitch}
          disabled={switching}
          className="mt-2 rounded-lg bg-destructive px-3 py-1.5 font-mono text-white text-xs transition-colors hover:bg-destructive/90 disabled:opacity-60"
        >
          {switching ? '切换中…' : '切换到 Sepolia'}
        </button>
      </div>
    </div>
  )
}
