import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { useEffect, useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useStakeETH } from '../hooks/useStakeETH'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS, isDeployed } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { TxSummaryCard } from './TxSummaryCard'

const PRESETS = ['0.01', '0.05', '0.1', '0.5'] as const

export function StakeForm() {
  const wallet = useWallet()
  const stake = useStakeETH()
  const [amount, setAmount] = useState('0.01')

  // Reset any previous tx state when the user starts a new amount
  useEffect(() => {
    if (stake.isSuccess || stake.isError) {
      stake.reset()
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: only re-reset on amount typing
  }, [amount])

  let inputWei = 0n
  try {
    inputWei = amount ? parseEther(amount) : 0n
  } catch {
    inputWei = 0n
  }

  // Apply the depositor's fixed 0.96 conversion rate for the preview without
  // calling the contract (which may not yet be deployed). Once contracts are
  // wired up, useTxSimulate will provide the authoritative number.
  const expectedPufETH = (inputWei * 96n) / 100n

  const canSubmit =
    isDeployed() &&
    wallet.isConnected &&
    wallet.isCorrectChain &&
    inputWei > 0n &&
    !stake.isPending

  const deployedYet = isDeployed()

  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2px]">
              Phase 3 · Mint pufETH
            </p>
            <h2 className="mt-1 font-semibold text-foreground text-xl">Stake ETH → pufETH</h2>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="stake-amount" className="text-text-tertiary text-xs uppercase tracking-wide">
            Amount (Sepolia ETH)
          </Label>
          <Input
            id="stake-amount"
            type="text"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 border-border bg-background font-mono text-foreground text-lg"
          />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button
                key={p}
                size="sm"
                variant="outline"
                onClick={() => setAmount(p)}
                className="font-mono text-text-tertiary text-xs"
                type="button"
              >
                {p} ETH
              </Button>
            ))}
          </div>
        </div>

        <TxSummaryCard
          action="Stake ETH to mint mock pufETH"
          inputLabel="You pay"
          inputAmount={inputWei}
          inputSymbol="ETH"
          outputLabel="You receive"
          outputAmount={expectedPufETH}
          outputSymbol="pufETH"
          contractAddress={CONTRACTS.depositor as Address}
          riskLevel={deployedYet ? 'Info' : 'Warning'}
          riskNote={
            deployedYet
              ? 'Sepolia mock contract — testnet demo, no real assets at risk.'
              : 'Contracts not yet deployed to Sepolia — run forge script first.'
          }
          exitNote="pufETH is redeemable for ETH via the depositor (Phase 10 redemption flow). Conversion rate is fixed at 0.96 pufETH per 1 ETH in this mock."
        />

        {stake.isError && (
          <div className="rounded-md border border-destructive/40 bg-error-surface/40 p-3 text-sm">
            <p className="font-mono font-semibold text-destructive">
              {stake.error.kind === 'simulation-failed' ? 'Simulation Failed' : 'Transaction Failed'}
            </p>
            <p className="mt-1 text-foreground text-xs">{'reason' in stake.error ? stake.error.reason : stake.error.kind}</p>
          </div>
        )}

        {stake.isSuccess && stake.data && (
          <div className="rounded-md border border-success/40 bg-success-surface/40 p-3 text-sm">
            <p className="font-mono font-semibold text-success-text">Broadcast confirmed</p>
            <p className="mt-1 break-all text-foreground text-xs">
              Tx hash:{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${stake.data.txHash}`}
                className="text-primary underline"
                rel="noreferrer noopener"
                target="_blank"
              >
                {stake.data.txHash}
              </a>
            </p>
            <p className="mt-1 text-foreground text-xs">
              Expected pufETH: <span className="font-mono">{formatTokenAmount(stake.data.expectedPufETH)}</span>
            </p>
          </div>
        )}

        <Button
          size="lg"
          className="w-full font-mono"
          disabled={!canSubmit}
          onClick={() => stake.mutate({ amountEth: amount })}
        >
          {!isDeployed()
            ? 'Awaiting Sepolia Deployment'
            : !wallet.isConnected
              ? 'Connect Wallet First'
              : !wallet.isCorrectChain
                ? 'Switch to Sepolia First'
                : stake.isPending
                  ? 'Signing & broadcasting…'
                  : 'Stake ETH'}
        </Button>
      </CardContent>
    </Card>
  )
}
