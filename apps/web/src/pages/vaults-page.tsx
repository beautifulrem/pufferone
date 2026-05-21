import { Badge } from '@repo/ui/components/badge'
import { useState } from 'react'
import { SafetyBar } from '../components/SafetyBar'
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
    <>
      <SafetyBar />
      <div className="mb-8">
        <p className="mb-3 font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2.5px]">
          题目要求 04 · UniFi Vault 机会
        </p>
        <h1 className="mb-4 font-bold text-4xl text-foreground leading-[1.1] tracking-tight">
          UniFi <span className="identity-gradient">Vaults</span>
        </h1>
        <p className="max-w-3xl text-text-secondary-gray leading-relaxed">
          题目要求"展示 UniFi Vault 机会"。已有 3 个 Puffer 作品只做"列卡 + 跳走主网"，
          没人让用户在 Mini App 内真实存入。PufferOne 自部署 4 个 Sepolia mock vault，
          实现了真正的"在 Mini App 内可交互"。
          APY 与 TVL 数字来自 Puffer 主网 API（实时）；存入流程跑 Sepolia 真签名。
        </p>
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-sm">
          <Badge variant="outline" className="text-text-tertiary">
            {apys.isLoading ? 'APY 加载中…' : apys.isError ? 'APY: fallback 估值' : `APY: ${Object.keys(apyByKey).length}/4 来自主网`}
          </Badge>
          <Badge variant="outline" className="text-text-tertiary">
            {tvls.isLoading ? 'TVL 加载中…' : tvls.isError ? 'TVL: fallback 估值' : `TVL: ${Object.keys(tvlByKey).length}/4 来自主网`}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
    </>
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
