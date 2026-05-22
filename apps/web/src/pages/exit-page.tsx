import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useState } from 'react'
import { Link } from 'react-router'
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
              有仓位
            </Badge>
          ) : (
            <Badge variant="outline" className="font-mono text-text-tertiary">
              无仓位
            </Badge>
          )}
        </div>

        <p className="font-mono text-sm text-text-tertiary">
          持有份额：{' '}
          <span className="text-foreground">{formatTokenAmount(balance)}</span> {vault.name}
        </p>

        {hasShares && (
          <>
            <div className="space-y-2">
              <Label className="text-text-tertiary text-xs uppercase tracking-wide">
                赎回份额
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
                <p className="text-success-text">赎回成功</p>
                <p className="break-all">
                  收到 {formatTokenAmount(withdraw.data.assetsOut)} pufETH ·{' '}
                  <a
                    href={`https://sepolia.etherscan.io/tx/${withdraw.data.txHash}`}
                    className="text-primary underline"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    Etherscan 查看
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
              {withdraw.isPending ? '赎回中…' : `赎回 ${shares} ${vault.name} → pufETH`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function ExitPage() {
  return (
    <div className="space-y-4 pb-6">
      <div>
        <p className="cyber-eyebrow">PUFFER // 赎回</p>
        <h1 className="mt-1 font-bold text-2xl text-foreground tracking-tight">
          退出仓位
        </h1>
        <p className="max-w-3xl text-text-secondary-gray leading-relaxed">
          每个 PufferOne 仓位都可以单步赎回。已有的 Puffer 作品都不做退出端——
          PufferOne 把「如何离开」这一步也写出来，体现完整生命周期（存入 → 管理 → 退出）。
        </p>
      </div>

      <Card className="border-border bg-card shadow-none">
        <CardContent className="space-y-2 p-4">
          <p className="cyber-eyebrow">pufETH → stETH / wstETH</p>
          <p className="font-mono font-semibold text-foreground text-sm">
            通过 DEX 反向兑换退出 pufETH
          </p>
          <p className="text-text-tertiary text-xs leading-relaxed">
            MockSwapRouter 已配置反向路径：pufETH → stETH（1.04）/ pufETH → wstETH（0.89）。生产环境走 PufferVault 提款队列（1–2 周延迟）。
          </p>
          <Button asChild size="sm" variant="outline" className="mt-2 font-mono">
            <Link to="/swap">前往兑换页 →</Link>
          </Button>
        </CardContent>
      </Card>

      <p className="cyber-eyebrow pt-2">UniFi 金库赎回</p>
      <div className="space-y-2">
        {VAULTS.map((v) => (
          <VaultExitCard key={v.key} vault={v} />
        ))}
      </div>
    </div>
  )
}
