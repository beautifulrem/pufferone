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
        <h1 className="font-bold text-2xl text-foreground tracking-tight">用 pufETH 进入收益策略</h1>
        <p className="mt-1.5 text-sm text-text-tertiary leading-relaxed">
          选择适合的收益策略，存入 pufETH，到期可随时赎回。
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-[10px]">
          <Badge variant="outline" className="border-border text-text-tertiary">
            {apys.isLoading
              ? '收益加载中'
              : apys.isError
                ? '收益 · 离线估算'
                : `收益 · 实时同步`}
          </Badge>
          <Badge variant="outline" className="border-border text-text-tertiary">
            {tvls.isLoading
              ? '规模加载中'
              : tvls.isError
                ? '规模 · 离线估算'
                : `规模 · 实时同步`}
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
