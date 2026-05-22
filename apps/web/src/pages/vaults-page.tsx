import { Badge } from '@repo/ui/components/badge'
import { useMemo, useState } from 'react'
import { VaultCard } from '../components/VaultCard'
import { VaultDepositModal } from '../components/VaultDepositModal'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useVaultAPYs, useVaultTVLs } from '../hooks/usePufferAPI'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { VAULTS, type VaultDescriptor } from '../lib/vaults'

export function VaultsPage() {
  const apys = useVaultAPYs()
  const tvls = useVaultTVLs()
  const wallet = useWallet()
  const [selectedVault, setSelectedVault] = useState<VaultDescriptor | null>(null)

  // 当前用户在 4 个金库的份额，用于「我的持仓」汇总
  const unifiETH = useTokenBalance(CONTRACTS.unifiETH)
  const unifiUSD = useTokenBalance(CONTRACTS.unifiUSD)
  const unifiBTC = useTokenBalance(CONTRACTS.unifiBTC)
  const pufETHs = useTokenBalance(CONTRACTS.pufETHs)
  const sharesByKey = useMemo<Record<string, bigint>>(
    () => ({
      unifiETH: unifiETH.data ?? 0n,
      unifiUSD: unifiUSD.data ?? 0n,
      unifiBTC: unifiBTC.data ?? 0n,
      pufETHs: pufETHs.data ?? 0n,
    }),
    [unifiETH.data, unifiUSD.data, unifiBTC.data, pufETHs.data],
  )

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

  // 汇总：有份额的金库数 + pufETH-equivalent 总额（按 sharePrice 估算）
  const heldVaults = VAULTS.filter((v) => sharesByKey[v.key] && sharesByKey[v.key]! > 0n)
  const totalPufETHEquivalent = heldVaults.reduce((acc, v) => {
    const shares = sharesByKey[v.key] ?? 0n
    return acc + (shares * v.sharePrice) / 1_000_000_000_000_000_000n
  }, 0n)

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

      {/* 我的持仓汇总 — 仅在已连接钱包且有任一金库份额时显示 */}
      {wallet.isConnected && heldVaults.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <p className="cyber-eyebrow text-primary">我的金库持仓</p>
            <span className="font-mono text-text-tertiary text-[10px]">
              {heldVaults.length} / {VAULTS.length} 个金库已申购
            </span>
          </div>
          <p className="mt-2 font-mono font-semibold text-2xl text-foreground leading-tight">
            ≈ {formatTokenAmount(totalPufETHEquivalent, 18, 4)}{' '}
            <span className="text-text-tertiary text-sm">pufETH</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {heldVaults.map((v) => (
              <span
                key={v.key}
                className="rounded-full bg-card px-2 py-0.5 font-mono text-[10px] text-text-secondary-gray"
              >
                {v.name}{' '}
                <span className="text-foreground">
                  {formatTokenAmount(sharesByKey[v.key] ?? 0n, 18, 4)}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

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
