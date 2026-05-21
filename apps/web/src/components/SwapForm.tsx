import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Slider } from '@repo/ui/components/slider'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useSwap } from '../hooks/useSwap'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { RoutePath } from './RoutePath'
import { TxSummaryCard } from './TxSummaryCard'

type InputToken = 'stETH' | 'wstETH'

const INPUT_ADDRESS: Record<InputToken, Address> = {
  stETH: CONTRACTS.stETH,
  wstETH: CONTRACTS.wstETH,
}

// Conversion rate (1e18-scaled) — must match what Deploy.s.sol set on the router:
//   stETH -> pufETH: 0.96
//   wstETH -> pufETH: 1.12
const RATE_BPS: Record<InputToken, bigint> = {
  stETH: 96n,
  wstETH: 112n,
}

export function SwapForm() {
  const wallet = useWallet()
  const [tokenIn, setTokenIn] = useState<InputToken>('stETH')
  const [amount, setAmount] = useState('10')
  const [slippageBps, setSlippageBps] = useState<number>(50) // 0.5%

  const balance = useTokenBalance(INPUT_ADDRESS[tokenIn])
  const allowance = useAllowance(INPUT_ADDRESS[tokenIn], CONTRACTS.swapRouter)
  const approve = useApprove()
  const swap = useSwap()

  useEffect(() => {
    if (swap.isSuccess || swap.isError) swap.reset()
    if (approve.isSuccess || approve.isError) approve.reset()
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on input change
  }, [tokenIn, amount])

  const inputWei = useMemo(() => {
    if (!amount) return 0n
    try {
      return parseEther(amount)
    } catch {
      return 0n
    }
  }, [amount])

  const expectedOut = (inputWei * RATE_BPS[tokenIn]) / 100n
  const minOut = (expectedOut * BigInt(10_000 - slippageBps)) / 10_000n

  const path: readonly Address[] = [INPUT_ADDRESS[tokenIn], CONTRACTS.pufETH]
  const routeLabels = [tokenIn, 'pufETH']

  const balanceAmount = balance.data ?? 0n
  const allowanceAmount = allowance.data ?? 0n
  const insufficientBalance = balanceAmount < inputWei
  const needsApproval = !insufficientBalance && allowanceAmount < inputWei
  const isPending = swap.isPending || approve.isPending

  const canSubmit =
    wallet.isConnected &&
    wallet.isCorrectChain &&
    inputWei > 0n &&
    !insufficientBalance &&
    !isPending

  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="space-y-6 p-6">
        <div>
          <p className="font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2px]">
            Phase 6 · DEX 聚合（进阶）
          </p>
          <h2 className="mt-1 font-semibold text-foreground text-xl">
            Any token → pufETH
          </h2>
        </div>

        {/* Token in selector */}
        <div>
          <Label className="mb-3 block text-text-tertiary text-xs uppercase tracking-wide">
            From
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {(['stETH', 'wstETH'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTokenIn(t)}
                className={`rounded-md border px-3 py-2 font-mono text-sm transition-colors ${
                  tokenIn === t
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-text-tertiary hover:border-border-strong'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-2 font-mono text-text-tertiary text-xs">
            Balance: {formatTokenAmount(balanceAmount)} {tokenIn}
            {insufficientBalance && balance.isFetched && (
              <span className="ml-2 text-warning">· faucet on Stake page first</span>
            )}
          </p>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="swap-amount" className="text-text-tertiary text-xs uppercase tracking-wide">
            Amount in
          </Label>
          <Input
            id="swap-amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-12 border-border bg-background font-mono text-foreground text-lg"
          />
        </div>

        {/* Slippage */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Label className="text-text-tertiary text-xs uppercase tracking-wide">
              Slippage tolerance
            </Label>
            <span className="font-mono text-foreground text-sm">
              {(slippageBps / 100).toFixed(2)}%
            </span>
          </div>
          <Slider
            min={10}
            max={500}
            step={10}
            value={[slippageBps]}
            onValueChange={([v]) => v !== undefined && setSlippageBps(v)}
            className="w-full"
          />
          <p className="mt-2 font-mono text-text-tertiary text-xs">
            Min you'll receive: {formatTokenAmount(minOut)} pufETH (enforced on-chain)
          </p>
        </div>

        {/* Route */}
        <div>
          <Label className="mb-2 block text-text-tertiary text-xs uppercase tracking-wide">
            Route
          </Label>
          <RoutePath tokens={routeLabels} />
          <p className="mt-2 font-mono text-text-tertiary text-xs">
            Single-hop via MockSwapRouter. Rate: {Number(RATE_BPS[tokenIn])}% {tokenIn} →
            pufETH (set in Deploy.s.sol).
          </p>
        </div>

        <TxSummaryCard
          action={`Swap ${tokenIn} → pufETH`}
          inputLabel="You pay"
          inputAmount={inputWei}
          inputSymbol={tokenIn}
          outputLabel="You receive (≥)"
          outputAmount={minOut}
          outputSymbol="pufETH"
          contractAddress={CONTRACTS.swapRouter as Address}
          riskLevel="Info"
          riskNote={`MockSwapRouter on Sepolia. Slippage protection: minOut enforced at ${(slippageBps / 100).toFixed(2)}% tolerance.`}
          exitNote="DEX swap mints pufETH directly via authorized minter pattern. Use Phase 10 redemption flow to exit pufETH back to ETH-equivalent."
        />

        {(approve.error || swap.error) && (
          <div className="rounded-md border border-destructive/40 bg-error-surface/40 p-3 text-sm">
            <p className="font-mono font-semibold text-destructive">Transaction Failed</p>
            <p className="mt-1 break-all text-foreground text-xs">
              {approve.error?.message ??
                ('reason' in (swap.error ?? {})
                  ? (swap.error as { reason: string }).reason
                  : 'Unknown error')}
            </p>
          </div>
        )}

        {swap.isSuccess && swap.data && (
          <div className="rounded-md border border-success/40 bg-success-surface/40 p-3 text-sm">
            <p className="font-mono font-semibold text-success-text">Swap confirmed</p>
            <p className="mt-1 break-all text-foreground text-xs">
              Tx:{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${swap.data.txHash}`}
                className="text-primary underline"
                rel="noreferrer noopener"
                target="_blank"
              >
                {swap.data.txHash}
              </a>
            </p>
            <p className="mt-1 text-foreground text-xs">
              Received: {formatTokenAmount(swap.data.amountOut)} pufETH
            </p>
          </div>
        )}

        {needsApproval ? (
          <Button
            size="lg"
            className="w-full font-mono"
            disabled={!canSubmit}
            onClick={() =>
              approve.mutate({
                token: INPUT_ADDRESS[tokenIn],
                spender: CONTRACTS.swapRouter,
                amount: inputWei,
              })
            }
          >
            {approve.isPending
              ? `Step 1/2: Approving ${tokenIn}…`
              : `Step 1/2: Approve exact ${formatTokenAmount(inputWei)} ${tokenIn}`}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full font-mono"
            disabled={!canSubmit}
            onClick={() => swap.mutate({ amount, path, minAmountOut: minOut })}
          >
            {!wallet.isConnected
              ? 'Connect Wallet First'
              : !wallet.isCorrectChain
                ? 'Switch to Sepolia First'
                : insufficientBalance
                  ? `Get ${tokenIn} from Stake page first`
                  : swap.isPending
                    ? 'Swapping…'
                    : `Step 2/2: Swap ${tokenIn} → pufETH`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
