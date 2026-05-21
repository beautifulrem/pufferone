import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useState } from 'react'
import { Link } from 'react-router'
import { SafetyBar } from '../components/SafetyBar'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useVaultWithdraw } from '../hooks/useVaultWithdraw'
import { useWallet } from '../hooks/useWallet'
import { formatTokenAmount } from '../lib/format'
import type { VaultDescriptor } from '../lib/vaults'
import { VAULTS } from '../lib/vaults'

function VaultExitCard({ vault }: { vault: VaultDescriptor }) {
  const wallet = useWallet()
  const sharesBalance = useTokenBalance(vault.address)
  const withdraw = useVaultWithdraw()
  const [shares, setShares] = useState('0.1')

  const balance = sharesBalance.data ?? 0n
  const hasShares = balance > 0n

  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-semibold text-foreground text-base">{vault.name}</h3>
          {hasShares ? (
            <Badge variant="success" className="font-mono">
              Has position
            </Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-text-tertiary">
              No position
            </Badge>
          )}
        </div>

        <p className="font-mono text-sm text-text-tertiary">
          Shares held:{' '}
          <span className="text-foreground">{formatTokenAmount(balance)}</span> {vault.name}
        </p>

        {hasShares && (
          <>
            <div className="space-y-2">
              <Label className="text-text-tertiary text-xs uppercase tracking-wide">
                Shares to redeem
              </Label>
              <Input
                type="text"
                inputMode="decimal"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="h-10 border-border bg-background font-mono"
              />
            </div>

            {withdraw.error && (
              <p className="font-mono text-destructive text-xs">{withdraw.error.reason}</p>
            )}

            {withdraw.isSuccess && withdraw.data && (
              <div className="rounded-md border border-success/40 bg-success-surface/40 p-2 font-mono text-xs">
                <p className="text-success-text">Withdraw confirmed</p>
                <p className="break-all">
                  Received {formatTokenAmount(withdraw.data.assetsOut)} pufETH ·{' '}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${withdraw.data.txHash}`}
                    className="text-primary underline"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    Etherscan
                  </a>
                </p>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="w-full font-mono"
              disabled={
                !wallet.isConnected || !wallet.isCorrectChain || withdraw.isPending
              }
              onClick={() => withdraw.mutate({ vault: vault.address, shares })}
            >
              {withdraw.isPending ? 'Redeeming…' : `Redeem ${shares} ${vault.name} → pufETH`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function ExitPage() {
  return (
    <>
      <SafetyBar />

      <div className="mb-8">
        <p className="mb-3 font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2.5px]">
          Phase 10 · Exit & Redemption
        </p>
        <h1 className="mb-4 font-bold text-4xl text-foreground leading-[1.1] tracking-tight">
          Exit your <span className="identity-gradient">positions</span>
        </h1>
        <p className="max-w-3xl text-text-secondary-gray leading-relaxed">
          每个 PufferOne 仓位都可以单步赎回。3 个已有 Puffer 作品都不做退出端 ——
          PufferOne 把"如何离开"这一步也写出来，体现完整生命周期 (deposit → manage → exit)。
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-primary/40 bg-primary/5 shadow-none lg:col-span-3">
          <CardContent className="space-y-2 p-5">
            <p className="font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2px]">
              pufETH → stETH / wstETH
            </p>
            <p className="font-semibold text-foreground">
              退出 pufETH 走 DEX swap（已配置反向路由）
            </p>
            <p className="text-sm text-text-secondary-gray leading-relaxed">
              MockSwapRouter 已在 Deploy.s.sol 配置了反向路径：pufETH → stETH (1.04) 和
              pufETH → wstETH (0.89)。到 Swap 页面切换 token in 顺序即可使用。生产环境的
              Puffer 会走 PufferVault 的提款队列（1-2 周延迟）。
            </p>
            <Button asChild size="sm" className="font-mono">
              <Link to="/swap">Open Swap →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="mb-4 font-mono text-[length:var(--text-caption)] text-text-tertiary uppercase tracking-[2.5px]">
        UniFi Vault redemption · pufETH 直接退回
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VAULTS.map((v) => (
          <VaultExitCard key={v.key} vault={v} />
        ))}
      </div>
    </>
  )
}
