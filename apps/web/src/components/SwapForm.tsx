import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { ArrowDownUp, CheckCircle2, ExternalLink, Info, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useActivityLog } from '../hooks/useActivityLog'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useSwap } from '../hooks/useSwap'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { MAINNET_AGGREGATOR_URL, SWAP_TOKENS, type SwapToken } from '../lib/swapTokens'
import { CornerBracketCard } from './CornerBracketCard'
import { GradientCTA } from './GradientCTA'
import { PercentChips } from './PercentChips'
import { SafetyProtectionsButton } from './SafetyProtectionsButton'
import { TokenIcon } from './TokenIcon'

type Direction = 'forward' | 'reverse'

const REVERSE_RATE_BPS: Record<string, bigint> = {
  stETH: 104n,
  wstETH: 89n,
}

export function SwapForm() {
  const wallet = useWallet()
  const [direction, setDirection] = useState<Direction>('forward')
  const [tokenKey, setTokenKey] = useState<string>('stETH')
  const [amount, setAmount] = useState('')
  const [slippageBps, setSlippageBps] = useState<number>(50)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const selectedToken: SwapToken =
    SWAP_TOKENS.find((t) => t.key === tokenKey) ?? SWAP_TOKENS[0] ?? {
      key: 'stETH',
      symbol: 'stETH',
      fullName: 'Lido Staked ETH',
      sepoliaAddress: CONTRACTS.stETH,
      rateBps: 96n,
      sepoliaSignable: true,
    }
  const signable = selectedToken.sepoliaSignable && selectedToken.sepoliaAddress
  const sepoliaAddress = selectedToken.sepoliaAddress

  const isReverse = direction === 'reverse'
  const inputToken = isReverse ? CONTRACTS.pufETH : sepoliaAddress
  const spenderToken = isReverse ? CONTRACTS.pufETH : sepoliaAddress

  const balance = useTokenBalance(signable ? inputToken : undefined)
  const allowance = useAllowance(
    signable ? spenderToken : undefined,
    signable ? CONTRACTS.swapRouter : undefined,
  )
  const approve = useApprove()
  const swap = useSwap()

  useEffect(() => {
    swap.reset()
    approve.reset()
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on user change
  }, [tokenKey, amount, direction])

  const log = useActivityLog()
  useEffect(() => {
    if (swap.isSuccess && swap.data) {
      const inSym = isReverse ? 'pufETH' : selectedToken.symbol
      const outSym = isReverse ? selectedToken.symbol : 'pufETH'
      log.add({
        type: 'swap',
        label: `闪兑 ${amount || '?'} ${inSym} → ${formatTokenAmount(swap.data.amountOut, 18, 4)} ${outSym}`,
        txHash: swap.data.txHash,
      })
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: log on success only
  }, [swap.isSuccess])

  const inputWei = useMemo(() => {
    if (!amount) return 0n
    try {
      return parseEther(amount)
    } catch {
      return 0n
    }
  }, [amount])

  const rateBps = isReverse ? (REVERSE_RATE_BPS[tokenKey] ?? 100n) : selectedToken.rateBps
  const expectedOut = (inputWei * rateBps) / 100n
  const minOut = (expectedOut * BigInt(10_000 - slippageBps)) / 10_000n

  const path: readonly Address[] = signable && sepoliaAddress
    ? isReverse
      ? [CONTRACTS.pufETH, sepoliaAddress]
      : [sepoliaAddress, CONTRACTS.pufETH]
    : []

  const balanceAmount = balance.data ?? 0n
  const allowanceAmount = allowance.data ?? 0n
  const insufficientBalance = signable ? balanceAmount < inputWei : false
  const needsApproval = signable && !insufficientBalance && allowanceAmount < inputWei
  const isPending = swap.isPending || approve.isPending

  const canSubmit =
    signable &&
    wallet.isConnected &&
    wallet.isCorrectChain &&
    inputWei > 0n &&
    !insufficientBalance &&
    !isPending

  const inputSymbol = isReverse ? 'pufETH' : selectedToken.symbol
  const outputSymbol = isReverse ? selectedToken.symbol : 'pufETH'

  const flip = () => {
    const next = direction === 'forward' ? 'reverse' : 'forward'
    setDirection(next)
    setAmount('')
    if (next === 'reverse' && !selectedToken.sepoliaSignable) {
      setTokenKey('stETH')
    }
  }

  return (
    <div className="space-y-4">
      <CornerBracketCard className="p-4">
        {/* Settings row */}
        <div className="mb-3 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            aria-label="滑点设置"
            className="text-text-tertiary hover:text-foreground"
          >
            <Settings2 size={16} />
          </button>
        </div>

        {settingsOpen && (
          <div className="mb-3 space-y-2 rounded-lg border border-border bg-background/40 p-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-text-tertiary text-xs">滑点容忍度</p>
              <span className="font-mono text-foreground text-sm">
                {(slippageBps / 100).toFixed(2)}%
              </span>
            </div>
            <SlippagePresets value={slippageBps} onChange={setSlippageBps} />
            <p className="text-[11px] text-text-tertiary leading-relaxed">
              如果实际收到的 pufETH 比预期少超过{' '}
              <span className="font-mono text-foreground">
                {(slippageBps / 100).toFixed(2)}%
              </span>
              ，交易会自动取消，资金原路退回。
            </p>
          </div>
        )}

        {/* Token chip selector */}
        <div className="mb-2 grid grid-cols-3 gap-1.5">
          {SWAP_TOKENS.map((t) => {
            const disabled = isReverse && !t.sepoliaSignable
            const active = tokenKey === t.key && !disabled
            return (
              <button
                key={t.key}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setTokenKey(t.key)}
                className={`relative flex items-center justify-center gap-1.5 rounded-full border px-3 py-2 font-mono text-sm transition-all ${
                  disabled
                    ? 'cursor-not-allowed border-border bg-card/50 text-text-tertiary/40'
                    : active
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card text-text-tertiary hover:border-border-strong hover:text-foreground'
                }`}
              >
                <TokenIcon symbol={t.symbol} size={16} />
                <span className="truncate">{t.symbol}</span>
                {!t.sepoliaSignable && (
                  <span
                    className={`-top-1.5 -right-1 absolute rounded-full px-1 py-0 text-[8px] leading-tight ${
                      active
                        ? 'bg-white/30 text-white'
                        : 'bg-warning/90 text-white'
                    }`}
                  >
                    主网
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Input card */}
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-text-tertiary text-xs">
            <span>支付</span>
            <span>
              {signable ? (
                <>
                  余额{' '}
                  <span className="text-foreground">
                    {formatTokenAmount(balanceAmount, 18, 4)}
                  </span>{' '}
                  {inputSymbol}
                </>
              ) : (
                <span className="text-text-tertiary">仅主网</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!signable}
              className="h-11 flex-1 border-0 bg-transparent p-0 font-mono text-2xl text-foreground shadow-none focus-visible:ring-0 disabled:opacity-50"
            />
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-foreground text-xs">
              <TokenIcon symbol={inputSymbol} size={18} />
              {inputSymbol}
            </div>
          </div>
          {signable && (
            <div className="mt-3">
              <PercentChips balance={balanceAmount} onPick={setAmount} />
            </div>
          )}
          {signable && rateBps > 0n && (
            <p className="mt-3 border-border border-t pt-2 font-mono text-[10px] text-text-tertiary">
              参考汇率 · 1 {inputSymbol} ≈{' '}
              {(Number(rateBps) / 100).toFixed(2)} {outputSymbol}
            </p>
          )}
        </div>

        {/* Flip arrow */}
        <div className="my-2 flex items-center justify-center">
          <button
            type="button"
            onClick={flip}
            className="rounded-full border border-border bg-card p-2 text-primary transition-transform hover:rotate-180"
          >
            <ArrowDownUp size={14} />
          </button>
        </div>

        {/* Output card */}
        <div className="rounded-2xl border border-border bg-background/50 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-text-tertiary text-xs">
            <span>至少收到</span>
            <span>滑点 {(slippageBps / 100).toFixed(2)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="flex-1 font-mono text-2xl text-foreground">
              {signable ? formatTokenAmount(minOut, 18, 6) : '—'}
            </p>
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-foreground text-sm">
              <TokenIcon symbol={outputSymbol} size={18} />
              {outputSymbol}
            </div>
          </div>
          {signable && (
            <p className="mt-2 font-mono text-[10px] text-text-tertiary">
              预计 {formatTokenAmount(expectedOut, 18, 6)} {outputSymbol} · 路由{' '}
              {inputSymbol} → {outputSymbol}
            </p>
          )}
        </div>

        {/* 主网提示卡（非 Sepolia-signable token，且 forward 方向） */}
        {!signable && !isReverse && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <Info size={14} className="mt-0.5 shrink-0 text-warning" />
            <div className="text-[11px] leading-relaxed">
              <p className="font-semibold text-foreground">
                {selectedToken.symbol} 仅在主网可用
              </p>
              <p className="mt-1 text-text-tertiary">
                Sepolia 测试网仅部署了 stETH / wstETH 的演示路径。如需在主网用{' '}
                {selectedToken.symbol} 兑换 pufETH，请前往 Puffer 官方入口。
              </p>
              <a
                href={MAINNET_AGGREGATOR_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex items-center gap-1 text-primary hover:underline"
              >
                前往 Puffer 主网应用 <ExternalLink size={11} />
              </a>
            </div>
          </div>
        )}

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
          {!signable && !isReverse ? (
            <Button disabled size="lg" className="w-full font-mono opacity-60">
              {selectedToken.symbol} 暂不可在测试网兑换
            </Button>
          ) : needsApproval && spenderToken ? (
            <GradientCTA
              loading={approve.isPending}
              disabled={!canSubmit}
              onClick={() =>
                approve.mutate({
                  token: spenderToken,
                  spender: CONTRACTS.swapRouter,
                  amount: inputWei,
                })
              }
            >
              {approve.isPending
                ? `授权 ${inputSymbol} 中…`
                : `授权 ${formatTokenAmount(inputWei, 18, 4)} ${inputSymbol}`}
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
                    ? `${inputSymbol} 余额不足`
                    : swap.isPending
                      ? '签名 & 广播中…'
                      : `兑换 ${inputSymbol} → ${outputSymbol}`}
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
                {outputSymbol}
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

const SLIPPAGE_PRESETS = [10, 50, 100] as const

function SlippagePresets({ value, onChange }: { value: number; onChange: (bps: number) => void }) {
  const isPreset = (SLIPPAGE_PRESETS as readonly number[]).includes(value)
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {SLIPPAGE_PRESETS.map((bps) => {
        const active = value === bps
        return (
          <button
            key={bps}
            type="button"
            onClick={() => onChange(bps)}
            className={`rounded-md border py-1.5 font-mono text-xs transition-colors ${
              active
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-text-tertiary hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {(bps / 100).toFixed(1)}%
          </button>
        )
      })}
      <div
        className={`flex items-center rounded-md border bg-card pr-2 transition-colors focus-within:border-primary/60 ${
          isPreset ? 'border-border' : 'border-primary'
        }`}
      >
        <input
          type="text"
          inputMode="decimal"
          placeholder="自定义"
          value={isPreset ? '' : (value / 100).toString()}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9.]/g, '')
            if (raw === '' || raw === '.') return
            const n = Number.parseFloat(raw)
            if (Number.isNaN(n)) return
            // 限制 0.01% – 5%
            const bps = Math.max(1, Math.min(500, Math.round(n * 100)))
            onChange(bps)
          }}
          className="w-full bg-transparent px-2 py-1.5 font-mono text-xs text-foreground placeholder:text-text-tertiary focus:outline-none"
        />
        <span className="shrink-0 font-mono text-text-tertiary text-xs">%</span>
      </div>
    </div>
  )
}
