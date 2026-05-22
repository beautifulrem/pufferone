import { Badge } from '@repo/ui/components/badge'
import { useState } from 'react'
import { VaultCard } from '../components/VaultCard'
import { VaultDepositModal } from '../components/VaultDepositModal'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useVaultAPYs, useVaultTVLs } from '../hooks/usePufferAPI'
import { VAULTS, type VaultDescriptor } from '../lib/vaults'

export function VaultsPage() {
  const apys = useVaultAPYs()
  const tvls = useVaultTVLs()
  const [selectedVault, setSelectedVault] = useState<VaultDescriptor | null>(null)

  const apyByKey: Record<string, number> = {}
  if (Array.isArray(apys.data)) {
    for (const entry of apys.data) {
      const match = VAULTS.find(
        (v) => v.address.toLowerCase() === entry.vault?.toLowerCase() || v.name === entry.vault,
      )
      if (match && typeof entry.apy === 'number') apyByKey[match.key] = entry.apy
    }
  }

  const tvlByKey: Record<string, number> = {}
  if (Array.isArray(tvls.data)) {
    for (const entry of tvls.data) {
      const match = VAULTS.find(
        (v) => v.address.toLowerCase() === entry.vault?.toLowerCase() || v.name === entry.vault,
      )
      if (match && typeof entry.tvl === 'number') tvlByKey[match.key] = entry.tvl
    }
  }

  return (
    <div className="space-y-4 pb-6">
      <div>
        <p className="cyber-eyebrow">PUFFER // VAULTS</p>
        <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">UniFi 金库</h1>
        <p className="mt-1.5 text-sm text-text-tertiary leading-relaxed">
          4 个 Sepolia mock vault，Mini App 内真实存入。APY/TVL 实时来自 Puffer 主网 API。
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px]">
          <Badge variant="outline" className="border-border text-text-tertiary">
            {apys.isLoading
              ? 'APY 加载中'
              : apys.isError
                ? 'APY · 用 fallback'
                : `APY · ${Object.keys(apyByKey).length}/4 主网实时`}
          </Badge>
          <Badge variant="outline" className="border-border text-text-tertiary">
            {tvls.isLoading
              ? 'TVL 加载中'
              : tvls.isError
                ? 'TVL · 用 fallback'
                : `TVL · ${Object.keys(tvlByKey).length}/4 主网实时`}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {VAULTS.map((vault) => (
          <VaultCardWithBalance
            key={vault.key}
            vault={vault}
            apy={apyByKey[vault.key]}
            tvl={tvlByKey[vault.key]}
            apyLoading={apys.isLoading}
            onDeposit={setSelectedVault}
          />
        ))}
      </div>

      <VaultDepositModal vault={selectedVault} onClose={() => setSelectedVault(null)} />
    </div>
  )
}

function VaultCardWithBalance(props: {
  vault: VaultDescriptor
  apy?: number
  tvl?: number
  apyLoading: boolean
  onDeposit: (v: VaultDescriptor) => void
}) {
  const shares = useTokenBalance(props.vault.address)
  return <VaultCard {...props} userShares={shares.data} />
}
