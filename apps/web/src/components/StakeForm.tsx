import { Button } from '@repo/ui/components/button'
import { Card, CardContent } from '@repo/ui/components/card'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { Separator } from '@repo/ui/components/separator'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, parseUnits, type Address } from 'viem'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useFaucet } from '../hooks/useFaucet'
import { useStakeERC20 } from '../hooks/useStakeERC20'
import { useStakeETH } from '../hooks/useStakeETH'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS, isDeployed } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { TxSummaryCard } from './TxSummaryCard'

type Token = 'ETH' | 'stETH' | 'wstETH'

const TOKEN_RATE: Record<Token, bigint> = {
  ETH: 96n,
  stETH: 96n,
  wstETH: 112n,
}

const TOKEN_ADDRESS: Record<Exclude<Token, 'ETH'>, Address> = {
  stETH: CONTRACTS.stETH,
  wstETH: CONTRACTS.wstETH,
}

function rateToPufETH(token: Token, inputWei: bigint): bigint {
  return (inputWei * TOKEN_RATE[token]) / 100n
}

export function StakeForm() {
  const wallet = useWallet()
  const [token, setToken] = useState<Token>('ETH')
  const [amount, setAmount] = useState('0.01')

  const isErc20 = token !== 'ETH'
  const tokenAddress = isErc20 ? TOKEN_ADDRESS[token] : undefined
  const balance = useTokenBalance(tokenAddress)
  const allowance = useAllowance(tokenAddress, isErc20 ? CONTRACTS.depositor : undefined)

  const stakeETH = useStakeETH()
  const stakeERC20 = useStakeERC20()
  const approve = useApprove()
  const faucet = useFaucet()

  // Reset state when changing token or amount
  useEffect(() => {
    if (stakeETH.isSuccess || stakeETH.isError) stakeETH.reset()
    if (stakeERC20.isSuccess || stakeERC20.isError) stakeERC20.reset()
    if (approve.isSuccess || approve.isError) approve.reset()
    if (faucet.isSuccess || faucet.isError) faucet.reset()
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on user change
  }, [token, amount])

  const inputWei = useMemo(() => {
    if (!amount) return 0n
    try {
      return token === 'ETH' ? parseEther(amount) : parseUnits(amount, 18)
    } catch {
      return 0n
    }
  }, [amount, token])

  const expectedPufETH = rateToPufETH(token, inputWei)

  const balanceAmount = balance.data ?? 0n
  const allowanceAmount = allowance.data ?? 0n
  const insufficientBalance = isErc20 && balanceAmount < inputWei
  const needsApproval = isErc20 && !insufficientBalance && allowanceAmount < inputWei
  const isPending =
    stakeETH.isPending || stakeERC20.isPending || approve.isPending || faucet.isPending

  const txData = stakeETH.data ?? stakeERC20.data ?? null
  const txError = stakeETH.error ?? stakeERC20.error ?? null

  const canSubmit =
    isDeployed() &&
    wallet.isConnected &&
    wallet.isCorrectChain &&
    inputWei > 0n &&
    !insufficientBalance &&
    !isPending

  const handlePrimary = () => {
    if (token === 'ETH') {
      stakeETH.mutate({ amountEth: amount })
    } else {
      stakeERC20.mutate({ token, amount })
    }
  }

  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="space-y-6 p-6">
        <div>
          <p className="font-mono text-[length:var(--text-caption)] text-primary uppercase tracking-[2px]">
            Phase 3-4 · Mint pufETH
          </p>
          <h2 className="mt-1 font-semibold text-foreground text-xl">
            Stake {token} → pufETH
          </h2>
        </div>

        {/* Token selector */}
        <div>
          <Label className="mb-3 block text-text-tertiary text-xs uppercase tracking-wide">
            Input token
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {(['ETH', 'stETH', 'wstETH'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setToken(t)}
                className={`rounded-md border px-3 py-2 font-mono text-sm transition-colors ${
                  token === t
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-text-tertiary hover:border-border-strong'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {isErc20 && (
            <p className="mt-2 font-mono text-text-tertiary text-xs">
              Balance: {formatTokenAmount(balanceAmount)} {token}
              {insufficientBalance && balance.isFetched && (
                <span className="ml-2 text-warning">· need to faucet first</span>
              )}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-3">
          <Label htmlFor="stake-amount" className="text-text-tertiary text-xs uppercase tracking-wide">
            Amount ({token})
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
            {(token === 'ETH' ? ['0.01', '0.05', '0.1', '0.5'] : ['1', '5', '10', '50']).map((p) => (
              <Button
                key={p}
                size="sm"
                variant="outline"
                onClick={() => setAmount(p)}
                className="font-mono text-text-tertiary text-xs"
                type="button"
              >
                {p} {token}
              </Button>
            ))}
          </div>
        </div>

        {/* Faucet (ERC20 only, when needed) */}
        {isErc20 && tokenAddress && insufficientBalance && (
          <div className="rounded-md border border-warning/40 bg-warning-surface/30 p-4">
            <p className="font-mono text-foreground text-sm">
              Need {token} test tokens?
            </p>
            <p className="mt-1 text-text-tertiary text-xs">
              The MockStETH/MockWstETH contracts have a permissionless faucet. Mint up to 100 per call.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 font-mono"
              disabled={faucet.isPending}
              onClick={() => faucet.mutate({ token: tokenAddress, amount: '100' })}
            >
              {faucet.isPending
                ? 'Minting…'
                : faucet.isSuccess
                  ? `Minted ✓`
                  : `Faucet mint 100 ${token}`}
            </Button>
            {faucet.isError && (
              <p className="mt-2 font-mono text-destructive text-xs">{faucet.error.message}</p>
            )}
          </div>
        )}

        <TxSummaryCard
          action={`Stake ${token} to mint mock pufETH`}
          inputLabel="You pay"
          inputAmount={inputWei}
          inputSymbol={token}
          outputLabel="You receive"
          outputAmount={expectedPufETH}
          outputSymbol="pufETH"
          contractAddress={CONTRACTS.depositor as Address}
          riskLevel="Info"
          riskNote={`Sepolia mock contract — testnet demo, no real assets at risk. Rate: ${TOKEN_RATE[token]}% ${token} → pufETH.`}
          exitNote="pufETH is redeemable for ETH via the depositor (Phase 10 redemption flow). ERC-20 paths use exact approvals, never infinite allowance."
        />

        {/* Errors */}
        {txError && (
          <div className="rounded-md border border-destructive/40 bg-error-surface/40 p-3 text-sm">
            <p className="font-mono font-semibold text-destructive">
              {txError.kind === 'simulation-failed' ? 'Simulation Failed' : 'Transaction Failed'}
            </p>
            <p className="mt-1 text-foreground text-xs">{'reason' in txError ? txError.reason : txError.kind}</p>
          </div>
        )}

        {/* Approve success (intermediate) */}
        {approve.isSuccess && !txData && (
          <div className="rounded-md border border-success/40 bg-success-surface/40 p-3 text-sm">
            <p className="font-mono font-semibold text-success-text">
              Approval confirmed · Step 2/2 ready
            </p>
            <p className="mt-1 break-all text-foreground text-xs">
              <a
                href={`https://sepolia.etherscan.io/tx/${approve.data}`}
                className="text-primary underline"
                rel="noreferrer noopener"
                target="_blank"
              >
                {approve.data}
              </a>
            </p>
          </div>
        )}

        {/* Stake success */}
        {txData && (
          <div className="rounded-md border border-success/40 bg-success-surface/40 p-3 text-sm">
            <p className="font-mono font-semibold text-success-text">Broadcast confirmed</p>
            <p className="mt-1 break-all text-foreground text-xs">
              Tx:{' '}
              <a
                href={`https://sepolia.etherscan.io/tx/${txData.txHash}`}
                className="text-primary underline"
                rel="noreferrer noopener"
                target="_blank"
              >
                {txData.txHash}
              </a>
            </p>
            <p className="mt-1 text-foreground text-xs">
              Received pufETH:{' '}
              <span className="font-mono">{formatTokenAmount(txData.expectedPufETH)}</span>
            </p>
          </div>
        )}

        <Separator />

        {/* Action buttons */}
        {needsApproval && tokenAddress ? (
          <Button
            size="lg"
            className="w-full font-mono"
            disabled={!canSubmit || approve.isPending}
            onClick={() =>
              approve.mutate({ token: tokenAddress, spender: CONTRACTS.depositor, amount: inputWei })
            }
          >
            {approve.isPending
              ? `Step 1/2: Approving ${token}…`
              : `Step 1/2: Approve exact ${formatTokenAmount(inputWei)} ${token}`}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full font-mono"
            disabled={!canSubmit}
            onClick={handlePrimary}
          >
            {!isDeployed()
              ? 'Awaiting Sepolia Deployment'
              : !wallet.isConnected
                ? 'Connect Wallet First'
                : !wallet.isCorrectChain
                  ? 'Switch to Sepolia First'
                  : insufficientBalance
                    ? `Get ${token} from faucet first`
                    : isPending
                      ? 'Signing & broadcasting…'
                      : isErc20
                        ? `Step 2/2: Deposit ${token}`
                        : `Stake ${token}`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
