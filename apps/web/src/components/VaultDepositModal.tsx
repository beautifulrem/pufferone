import { Button } from '@repo/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Separator } from '@repo/ui/components/separator'
import { ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useActivityLog } from '../hooks/useActivityLog'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useVaultDeposit } from '../hooks/useVaultDeposit'
import { useVaultWithdraw } from '../hooks/useVaultWithdraw'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import type { VaultDescriptor } from '../lib/vaults'
import { TokenIcon } from './TokenIcon'
import { TxSummaryCard } from './TxSummaryCard'
import { VaultAPYChart } from './VaultAPYChart'

type Mode = 'deposit' | 'withdraw'

export type VaultDepositModalProps = {
  vault: VaultDescriptor | null
  onClose: () => void
}

export function VaultDepositModal({ vault, onClose }: VaultDepositModalProps) {
  const wallet = useWallet()
  const [mode, setMode] = useState<Mode>('deposit')
  const [amount, setAmount] = useState('0.5')

  const pufETHBalance = useTokenBalance(CONTRACTS.pufETH)
  const sharesBalance = useTokenBalance(vault?.address)
  const allowance = useAllowance(CONTRACTS.pufETH, vault?.address)
  const approve = useApprove()
  const deposit = useVaultDeposit()
  const withdraw = useVaultWithdraw()
  const log = useActivityLog()

  useEffect(() => {
    if (deposit.isSuccess && deposit.data && vault) {
      log.add({
        type: 'vault-deposit',
        label: `申购 ${amount || '?'} pufETH → ${vault.name}`,
        txHash: deposit.data.txHash,
      })
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: log on success only
  }, [deposit.isSuccess])

  useEffect(() => {
    if (withdraw.isSuccess && withdraw.data && vault) {
      log.add({
        type: 'vault-withdraw',
        label: `赎回 ${amount || '?'} ${vault.name} → pufETH`,
        txHash: withdraw.data.txHash,
      })
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: log on success only
  }, [withdraw.isSuccess])

  // 切换 vault / mode 时清空
  useEffect(() => {
    setAmount(mode === 'deposit' ? '0.5' : '0.1')
    if (approve.isSuccess || approve.isError) approve.reset()
    if (deposit.isSuccess || deposit.isError) deposit.reset()
    if (withdraw.isSuccess || withdraw.isError) withdraw.reset()
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on vault/mode change
  }, [vault?.address, mode])

  const inputWei = useMemo(() => {
    if (!amount) return 0n
    try {
      return parseEther(amount)
    } catch {
      return 0n
    }
  }, [amount])

  if (!vault) return null

  const pufBalance = pufETHBalance.data ?? 0n
  const shareBalance = sharesBalance.data ?? 0n
  const allowanceAmount = allowance.data ?? 0n

  const insufficientBalance =
    mode === 'deposit' ? pufBalance < inputWei : shareBalance < inputWei

  const needsApproval = mode === 'deposit' && !insufficientBalance && allowanceAmount < inputWei

  // shares = assets * 1e18 / sharePrice
  const expectedShares = (inputWei * 1_000_000_000_000_000_000n) / vault.sharePrice
  // assets = shares * sharePrice / 1e18
  const expectedAssets = (inputWei * vault.sharePrice) / 1_000_000_000_000_000_000n

  const isPending = approve.isPending || deposit.isPending || withdraw.isPending

  const canSubmit =
    wallet.isConnected &&
    wallet.isCorrectChain &&
    inputWei > 0n &&
    !insufficientBalance &&
    !isPending

  const handlePrimary = () => {
    if (mode === 'deposit') {
      deposit.mutate({ vault: vault.address, amount })
    } else {
      withdraw.mutate({ vault: vault.address, shares: amount })
    }
  }

  // 共用变量
  const sourceSymbol = mode === 'deposit' ? 'pufETH' : vault.name
  const targetSymbol = mode === 'deposit' ? vault.name : 'pufETH'
  const balanceForMode = mode === 'deposit' ? pufBalance : shareBalance
  const outAmount = mode === 'deposit' ? expectedShares : expectedAssets

  const success = mode === 'deposit' ? deposit.data : withdraw.data
  const errorObj = mode === 'deposit' ? deposit.error : withdraw.error

  return (
    <Dialog open={vault !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <TokenIcon symbol={vault.name} size={24} />
            {vault.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mode 切换 */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-background/60 p-1">
            <button
              type="button"
              onClick={() => setMode('deposit')}
              className={`rounded-md py-2 font-mono text-sm transition-all ${
                mode === 'deposit'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-tertiary hover:text-foreground'
              }`}
            >
              存入
            </button>
            <button
              type="button"
              onClick={() => setMode('withdraw')}
              className={`rounded-md py-2 font-mono text-sm transition-all ${
                mode === 'withdraw'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-tertiary hover:text-foreground'
              }`}
            >
              赎回
            </button>
          </div>

          {/* 产品介绍卡 */}
          <div className="rounded-lg border border-border bg-background/40 p-4">
            <p className="cyber-eyebrow text-text-tertiary">产品介绍</p>
            <p className="mt-2 text-sm text-foreground leading-relaxed">{vault.intro}</p>
            <a
              href={vault.docsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1 text-primary text-xs hover:underline"
            >
              查看产品主页 <ExternalLink size={11} />
            </a>
          </div>

          {/* APY 历史大图 — 仅申购时展示（赎回时不影响决策） */}
          {mode === 'deposit' && (
            <VaultAPYChart vaultKey={vault.key} baseAPY={vault.fallbackAPY} />
          )}

          <div className="rounded-md border border-border bg-background/40 p-3 font-mono text-sm">
            {mode === 'deposit' ? '你的 pufETH 余额：' : `你的 ${vault.name} 份额：`}{' '}
            <span className="text-foreground">{formatTokenAmount(balanceForMode)}</span>
            {insufficientBalance && (
              <span className="ml-2 text-warning">
                · {mode === 'deposit' ? '余额不足，请先质押更多 pufETH' : '没有可赎回的份额'}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-text-tertiary text-xs uppercase tracking-wide">
              {mode === 'deposit' ? '存入数量' : '赎回份额'}
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 border-border bg-background font-mono"
            />
            <div className="flex flex-wrap gap-2">
              {(mode === 'deposit' ? ['0.1', '0.5', '1', '5'] : ['25%', '50%', '75%', 'MAX']).map(
                (p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (mode === 'deposit') {
                        setAmount(p)
                      } else {
                        const pct =
                          p === 'MAX' ? 100n : BigInt(Number.parseInt(p, 10))
                        const pick = (shareBalance * pct) / 100n
                        setAmount(formatTokenAmount(pick, 18, 6))
                      }
                    }}
                    className="font-mono text-text-tertiary text-xs"
                    type="button"
                  >
                    {mode === 'deposit' ? `${p} pufETH` : p}
                  </Button>
                ),
              )}
            </div>
          </div>

          <TxSummaryCard
            action={
              mode === 'deposit'
                ? `将 pufETH 存入 ${vault.name}`
                : `从 ${vault.name} 赎回为 pufETH`
            }
            inputLabel="你支付"
            inputAmount={inputWei}
            inputSymbol={sourceSymbol}
            outputLabel="你收到"
            outputAmount={outAmount}
            outputSymbol={targetSymbol}
            contractAddress={vault.address as Address}
            riskLevel={
              vault.risk === 'Low' ? 'Info' : vault.risk === 'Medium' ? 'Warning' : 'Danger'
            }
            riskNote={`${vault.risk === 'Low' ? '稳健型' : vault.risk === 'Medium' ? '平衡型' : '进取型'}产品：${(Number(vault.sharePrice) / 1e18).toFixed(3)} pufETH = 1 份金库份额，份额价格会随收益累积上涨。`}
          />

          {(approve.error || errorObj) && (
            <div className="rounded-md border border-destructive/40 bg-error-surface/40 p-3 text-sm">
              <p className="font-mono font-semibold text-destructive">交易失败</p>
              <p className="mt-1 break-all text-foreground text-xs">
                {approve.error?.message ??
                  ('reason' in (errorObj ?? {})
                    ? (errorObj as { reason: string }).reason
                    : '未知错误')}
              </p>
            </div>
          )}

          {success && (
            <div className="rounded-md border border-success/40 bg-success-surface/40 p-3 text-sm">
              <p className="font-mono font-semibold text-success-text">
                {mode === 'deposit' ? '存入成功' : '赎回成功'}
              </p>
              <p className="mt-1 break-all text-foreground text-xs">
                交易哈希：{' '}
                <a
                  href={`https://sepolia.etherscan.io/tx/${success.txHash}`}
                  className="text-primary underline"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {success.txHash}
                </a>
              </p>
              <p className="mt-1 text-foreground text-xs">
                收到：
                {mode === 'deposit'
                  ? `${formatTokenAmount((success as { expectedShares: bigint }).expectedShares)} ${vault.name}`
                  : `${formatTokenAmount((success as { assetsOut: bigint }).assetsOut)} pufETH`}
              </p>
            </div>
          )}

          <Separator />

          {needsApproval ? (
            <Button
              size="lg"
              className="w-full font-mono"
              disabled={!canSubmit}
              onClick={() =>
                approve.mutate({
                  token: CONTRACTS.pufETH,
                  spender: vault.address,
                  amount: inputWei,
                })
              }
            >
              {approve.isPending
                ? `第 1/2 步：授权 ${formatTokenAmount(inputWei)} pufETH 中…`
                : `第 1/2 步：精确授权 ${formatTokenAmount(inputWei)} pufETH`}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full font-mono"
              disabled={!canSubmit}
              onClick={handlePrimary}
            >
              {!wallet.isConnected
                ? '请先连接钱包'
                : !wallet.isCorrectChain
                  ? '请先切换到 Sepolia'
                  : insufficientBalance
                    ? mode === 'deposit'
                      ? '请先质押更多 pufETH'
                      : `没有 ${vault.name} 份额`
                    : isPending
                      ? mode === 'deposit'
                        ? '存入中…'
                        : '赎回中…'
                      : mode === 'deposit'
                        ? `第 2/2 步：存入 ${vault.name}`
                        : `赎回 ${vault.name} → pufETH`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
