import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { Slider } from '@repo/ui/components/slider'
import { ArrowDown, CheckCircle2, ExternalLink, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useSwap } from '../hooks/useSwap'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { CornerBracketCard } from './CornerBracketCard'
import { GradientCTA } from './GradientCTA'
import { SafetyProtectionsButton } from './SafetyProtectionsButton'
import { TokenIcon } from './TokenIcon'

type InputToken = 'stETH' | 'wstETH'

const INPUT_ADDRESS: Record<InputToken, Address> = {
  stETH: CONTRACTS.stETH,
  wstETH: CONTRACTS.wstETH,
}

const RATE_BPS: Record<InputToken, bigint> = {
  stETH: 96n,
  wstETH: 112n,
}

export function SwapForm() {
  const wallet = useWallet()
  const [tokenIn, setTokenIn] = useState<InputToken>('stETH')
  const [amount, setAmount] = useState('')
  const [slippageBps, setSlippageBps] = useState<number>(50)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const balance = useTokenBalance(INPUT_ADDRESS[tokenIn])
  const allowance = useAllowance(INPUT_ADDRESS[tokenIn], CONTRACTS.swapRouter)
  const approve = useApprove()
  const swap = useSwap()

  useEffect(() => {
    swap.reset()
    approve.reset()
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on user change
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

  const balanceAmount = balance.data ?? 0n
  const allowanceAmount = allowance.data ?? 0n
  const insufficientBalance = balanceAmount < inputWei
  const needsApproval = !insufficientBalance && allowanceAmount < inputWei
  const isPending = swap.isPending || approve.isPending

  const canSubmit =
    wallet.isConnected && wallet.isCorrectChain && inputWei > 0n && !insufficientBalance && !isPending

  const setMax = () => setAmount(formatTokenAmount(balanceAmount, 18, 6))

  return (
    <div className="space-y-4">
      <CornerBracketCard className="p-4">
        {/* Settings row */}
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-text-tertiary text-xs">兑换 → pufETH</p>
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="text-text-tertiary hover:text-foreground"
          >
            <Settings2 size={16} />
          </button>
        </div>

        {settingsOpen && (
          <div className="mb-3 rounded-lg border border-border bg-background/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-mono text-text-tertiary text-xs">滑点容忍度</p>
              <span className="font-mono text-foreground text-sm">{(slippageBps / 100).toFixed(2)}%</span>
            </div>
            <Slider
              min={10}
              max={500}
              step={10}
              value={[slippageBps]}
              onValueChange={([v]) => v !== undefined && setSlippageBps(v)}
            />
            <p className="mt-2 font-mono text-[10px] text-text-tertiary">
              链上强制 minOut · 实际收到 {'<'} {(slippageBps / 100).toFixed(2)}% 会 revert
            </p>
          </div>
        )}

        {/* Input card */}
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-text-tertiary text-xs">
            <span>支付</span>
            <span>
              余额{' '}
              <span className="text-foreground">{formatTokenAmount(balanceAmount, 18, 4)}</span>{' '}
              <button
                type="button"
                onClick={setMax}
                className="ml-1.5 rounded bg-primary/15 px-1.5 py-0.5 text-primary text-[10px] uppercase tracking-wider"
              >
                Max
              </button>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 flex-1 border-0 bg-transparent p-0 font-mono text-2xl text-foreground shadow-none focus-visible:ring-0"
            />
            <select
              value={tokenIn}
              onChange={(e) => setTokenIn(e.target.value as InputToken)}
              className="appearance-none rounded-full border border-border bg-card px-3 py-1.5 font-mono text-foreground text-sm"
            >
              {(['stETH', 'wstETH'] as const).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Arrow */}
        <div className="my-2 flex items-center justify-center">
          <div className="rounded-full border border-border bg-card p-2 text-primary">
            <ArrowDown size={14} />
          </div>
        </div>

        {/* Output card */}
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-text-tertiary text-xs">
            <span>至少收到</span>
            <span>滑点 {(slippageBps / 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="flex-1 font-mono text-2xl text-foreground">
              {formatTokenAmount(minOut, 18, 6)}
            </p>
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-foreground text-sm">
              <TokenIcon symbol="pufETH" size={18} />
              pufETH
            </div>
          </div>
          <p className="mt-2 font-mono text-[10px] text-text-tertiary">
            预计 {formatTokenAmount(expectedOut, 18, 6)} pufETH · 路由 {tokenIn} → pufETH
          </p>
        </div>

        {/* Errors */}
        {(approve.error || swap.error) && (
          <p className="mt-3 font-mono text-destructive text-xs">
            ❌{' '}
            {approve.error?.message ??
              ('reason' in (swap.error ?? {})
                ? (swap.error as { reason: string }).reason
                : '未知错误')}
          </p>
        )}

        {approve.isSuccess && !swap.data && (
          <p className="mt-3 font-mono text-success text-xs">✓ 授权成功 · 现在确认 swap</p>
        )}

        {/* Action */}
        <div className="mt-4">
          {needsApproval ? (
            <GradientCTA
              loading={approve.isPending}
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
                ? `授权 ${tokenIn} 中…`
                : `授权 ${formatTokenAmount(inputWei, 18, 4)} ${tokenIn}`}
            </GradientCTA>
          ) : (
            <GradientCTA
              loading={swap.isPending}
              disabled={!canSubmit}
              onClick={() => swap.mutate({ amount, path, minAmountOut: minOut })}
            >
              {!wallet.isConnected
                ? '请先连接钱包'
                : !wallet.isCorrectChain
                  ? '请切换到 Sepolia'
                  : insufficientBalance
                    ? `余额不足，去 Stake 页面 faucet ${tokenIn}`
                    : swap.isPending
                      ? '签名 & 广播中…'
                      : `兑换 ${tokenIn} → pufETH`}
            </GradientCTA>
          )}
        </div>
      </CornerBracketCard>

      {/* TX Success */}
      {swap.isSuccess && swap.data && (
        <CornerBracketCard className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <p className="font-mono font-semibold text-success text-sm">兑换成功</p>
              <p className="mt-1 font-mono text-text-tertiary text-xs">
                收到{' '}
                <span className="text-primary">{formatTokenAmount(swap.data.amountOut, 18, 6)}</span>{' '}
                pufETH
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${swap.data.txHash}`}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex items-center gap-1 font-mono text-primary text-xs hover:underline"
              >
                Etherscan 查看 <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </CornerBracketCard>
      )}

      <SafetyProtectionsButton />
    </div>
  )
}
