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
            Deposit pufETH → {vault.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-background/40 p-3 font-mono text-sm">
            Your pufETH balance:{' '}
            <span className="text-foreground">{formatTokenAmount(balanceAmount)}</span>
            {insufficientBalance && pufETHBalance.isFetched && (
              <span className="ml-2 text-warning">· need to stake more pufETH first</span>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-text-tertiary text-xs uppercase tracking-wide">
              Deposit amount
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
            action={`Deposit pufETH into ${vault.name}`}
            inputLabel="You deposit"
            inputAmount={inputWei}
            inputSymbol="pufETH"
            outputLabel="You receive"
            outputAmount={expectedShares}
            outputSymbol={vault.name}
            contractAddress={vault.address as Address}
            riskLevel={
              vault.risk === 'Low' ? 'Info' : vault.risk === 'Medium' ? 'Warning' : 'Danger'
            }
            riskNote={`${vault.risk} risk profile — Sepolia mock vault. Share price ${(Number(vault.sharePrice) / 1e18).toFixed(3)} pufETH/share.`}
            exitNote="Vault shares can be redeemed via withdraw() (Phase 10 exit flow). All approvals use exact amounts, not infinite — per security skill."
          />

          {(approve.error || deposit.error) && (
            <div className="rounded-md border border-destructive/40 bg-error-surface/40 p-3 text-sm">
              <p className="font-mono font-semibold text-destructive">Transaction Failed</p>
              <p className="mt-1 break-all text-foreground text-xs">
                {approve.error?.message ??
                  ('reason' in (deposit.error ?? {})
                    ? (deposit.error as { reason: string }).reason
                    : 'Unknown error')}
              </p>
            </div>
          )}

          {deposit.isSuccess && deposit.data && (
            <div className="rounded-md border border-success/40 bg-success-surface/40 p-3 text-sm">
              <p className="font-mono font-semibold text-success-text">Deposit confirmed</p>
              <p className="mt-1 break-all text-foreground text-xs">
                Tx:{' '}
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
                Received: {formatTokenAmount(deposit.data.expectedShares)} {vault.name}
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
                ? `Step 1/2: Approving ${formatTokenAmount(inputWei)} pufETH…`
                : `Step 1/2: Approve exact ${formatTokenAmount(inputWei)} pufETH`}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full font-mono"
              disabled={!canSubmit}
              onClick={() => deposit.mutate({ vault: vault.address, amount })}
            >
              {!wallet.isConnected
                ? 'Connect Wallet First'
                : !wallet.isCorrectChain
                  ? 'Switch to Sepolia First'
                  : insufficientBalance
                    ? `Stake more pufETH first`
                    : deposit.isPending
                      ? 'Depositing…'
                      : `Step 2/2: Deposit into ${vault.name}`}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
