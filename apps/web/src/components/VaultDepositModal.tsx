import { Button } from '@repo/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Separator } from '@repo/ui/components/separator'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useVaultDeposit } from '../hooks/useVaultDeposit'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import type { VaultDescriptor } from '../lib/vaults'
import { TxSummaryCard } from './TxSummaryCard'

export type VaultDepositModalProps = {
  vault: VaultDescriptor | null
  onClose: () => void
}

export function VaultDepositModal({ vault, onClose }: VaultDepositModalProps) {
  const wallet = useWallet()
  const [amount, setAmount] = useState('0.5')

  const pufETHBalance = useTokenBalance(CONTRACTS.pufETH)
  const allowance = useAllowance(CONTRACTS.pufETH, vault?.address)
  const approve = useApprove()
  const deposit = useVaultDeposit()

  useEffect(() => {
    setAmount('0.5')
    if (approve.isSuccess || approve.isError) approve.reset()
    if (deposit.isSuccess || deposit.isError) deposit.reset()
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on vault change
  }, [vault?.address])

  const inputWei = useMemo(() => {
    if (!amount) return 0n
    try {
      return parseEther(amount)
    } catch {
      return 0n
    }
  }, [amount])

  if (!vault) return null

  const balanceAmount = pufETHBalance.data ?? 0n
  const allowanceAmount = allowance.data ?? 0n
  const insufficientBalance = balanceAmount < inputWei
  const needsApproval = !insufficientBalance && allowanceAmount < inputWei

  // shares = assets * 1e18 / sharePrice
  const expectedShares = (inputWei * 1_000_000_000_000_000_000n) / vault.sharePrice

  const canSubmit =
    wallet.isConnected &&
    wallet.isCorrectChain &&
    inputWei > 0n &&
    !insufficientBalance &&
    !approve.isPending &&
    !deposit.isPending

  return (
    <Dialog open={vault !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">
            存入 pufETH → {vault.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-background/40 p-3 font-mono text-sm">
            你的 pufETH 余额：{' '}
            <span className="text-foreground">{formatTokenAmount(balanceAmount)}</span>
            {insufficientBalance && pufETHBalance.isFetched && (
              <span className="ml-2 text-warning">· 余额不足，请先去质押更多 pufETH</span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-text-tertiary text-xs uppercase tracking-wide">
              存入数量
            </Label>
            <Input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 border-border bg-background font-mono"
            />
            <div className="flex flex-wrap gap-2">
              {['0.1', '0.5', '1', '5'].map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant="outline"
                  onClick={() => setAmount(p)}
                  className="font-mono text-text-tertiary text-xs"
                  type="button"
                >
                  {p} pufETH
                </Button>
              ))}
            </div>
          </div>

          <TxSummaryCard
            action={`将 pufETH 存入 ${vault.name}`}
            inputLabel="你支付"
            inputAmount={inputWei}
            inputSymbol="pufETH"
            outputLabel="你收到"
            outputAmount={expectedShares}
            outputSymbol={vault.name}
            contractAddress={vault.address as Address}
            riskLevel={
              vault.risk === 'Low' ? 'Info' : vault.risk === 'Medium' ? 'Warning' : 'Danger'
            }
            riskNote={`${vault.risk === 'Low' ? '稳健型' : vault.risk === 'Medium' ? '平衡型' : '进取型'}产品：${(Number(vault.sharePrice) / 1e18).toFixed(3)} pufETH = 1 份金库份额，份额价格会随收益累积上涨。`}
            exitNote="想取出来的时候，去「更多 → 赎回与退出」一步就能换回 pufETH，不用等主网 1–2 周的提款队列。"
          />

          {(approve.error || deposit.error) && (
            <div className="rounded-md border border-destructive/40 bg-error-surface/40 p-3 text-sm">
              <p className="font-mono font-semibold text-destructive">交易失败</p>
              <p className="mt-1 break-all text-foreground text-xs">
                {approve.error?.message ??
                  ('reason' in (deposit.error ?? {})
                    ? (deposit.error as { reason: string }).reason
                    : '未知错误')}
              </p>
            </div>
          )}

          {deposit.isSuccess && deposit.data && (
            <div className="rounded-md border border-success/40 bg-success-surface/40 p-3 text-sm">
              <p className="font-mono font-semibold text-success-text">存入成功</p>
              <p className="mt-1 break-all text-foreground text-xs">
                交易哈希：{' '}
                <a
                  href={`https://sepolia.etherscan.io/tx/${deposit.data.txHash}`}
                  className="text-primary underline"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {deposit.data.txHash}
                </a>
              </p>
              <p className="mt-1 text-foreground text-xs">
                收到：{formatTokenAmount(deposit.data.expectedShares)} {vault.name}
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
              onClick={() => deposit.mutate({ vault: vault.address, amount })}
            >
              {!wallet.isConnected
                ? '请先连接钱包'
                : !wallet.isCorrectChain
                  ? '请先切换到 Sepolia'
                  : insufficientBalance
                    ? '请先质押更多 pufETH'
                    : deposit.isPending
                      ? '存入中…'
                      : `第 2/2 步：存入 ${vault.name}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
