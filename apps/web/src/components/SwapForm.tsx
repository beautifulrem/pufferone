import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { ArrowDown, CheckCircle2, ExternalLink, Info, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, type Address } from 'viem'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useSwap } from '../hooks/useSwap'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { MAINNET_AGGREGATOR_URL, SWAP_TOKENS, type SwapToken } from '../lib/swapTokens'
import { AIInsight } from './AIInsight'
import { CornerBracketCard } from './CornerBracketCard'
import { GradientCTA } from './GradientCTA'
import { PercentChips } from './PercentChips'
import { SafetyProtectionsButton } from './SafetyProtectionsButton'
import { TokenIcon } from './TokenIcon'

export function SwapForm() {
  const wallet = useWallet()
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

  // Balance / allowance only meaningful for Sepolia-signable tokens
  const balance = useTokenBalance(signable ? sepoliaAddress : undefined)
  const allowance = useAllowance(
    signable ? sepoliaAddress : undefined,
    signable ? CONTRACTS.swapRouter : undefined,
  )
  const approve = useApprove()
  const swap = useSwap()

  useEffect(() => {
    swap.reset()
    approve.reset()
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on user change
  }, [tokenKey, amount])

  const inputWei = useMemo(() => {
    if (!amount) return 0n
    try {
      return parseEther(amount)
    } catch {
      return 0n
    }
  }, [amount])

  const expectedOut = (inputWei * selectedToken.rateBps) / 100n
  const minOut = (expectedOut * BigInt(10_000 - slippageBps)) / 10_000n

  const path: readonly Address[] = signable && sepoliaAddress
    ? [sepoliaAddress, CONTRACTS.pufETH]
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

  return (
    <div className="space-y-4">
      <AIInsight
        ctx={{ operation: 'swap', amount: inputWei, tokenIn: selectedToken.symbol }}
      />

      <CornerBracketCard className="p-4">
        {/* Settings row */}
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-text-tertiary text-xs">闪兑 · 一键换 pufETH</p>
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
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

        {/* Token chip selector — horizontally scrollable list */}
        <div className="-mx-1 mb-2 overflow-x-auto px-1 no-scrollbar">
          <div className="flex gap-1.5">
            {SWAP_TOKENS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTokenKey(t.key)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-all ${
                  tokenKey === t.key
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                    : 'border-border bg-card text-text-tertiary hover:border-border-strong hover:text-foreground'
                }`}
              >
                <TokenIcon symbol={t.symbol} size={14} />
                {t.symbol}
                {!t.sepoliaSignable && (
                  <span
                    className={`ml-0.5 rounded-full px-1 py-0 text-[9px] ${
                      tokenKey === t.key ? 'bg-white/25 text-white' : 'bg-warning/15 text-warning'
                    }`}
                  >
                    主网
                  </span>
                )}
              </button>
            ))}
          </div>
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
                  {selectedToken.symbol}
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
              <TokenIcon symbol={selectedToken.symbol} size={18} />
              {selectedToken.symbol}
            </div>
          </div>
          {signable && (
            <div className="mt-3">
              <PercentChips balance={balanceAmount} onPick={setAmount} />
            </div>
          )}
          {signable && selectedToken.rateBps > 0n && (
            <p className="mt-3 border-border border-t pt-2 font-mono text-[10px] text-text-tertiary">
              参考汇率 · 1 {selectedToken.symbol} ≈{' '}
              {(Number(selectedToken.rateBps) / 100).toFixed(2)} pufETH
            </p>
          )}
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
              {signable ? formatTokenAmount(minOut, 18, 6) : '—'}
            </p>
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-foreground text-sm">
              <TokenIcon symbol="pufETH" size={18} />
              pufETH
            </div>
          </div>
          {signable && (
            <p className="mt-2 font-mono text-[10px] text-text-tertiary">
              预计 {formatTokenAmount(expectedOut, 18, 6)} pufETH · 路由{' '}
              {selectedToken.symbol} → pufETH
            </p>
          )}
        </div>

        {/* 主网提示卡（非 Sepolia-signable token） */}
        {!signable && (
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
          {!signable ? (
            <Button disabled size="lg" className="w-full font-mono opacity-60">
              {selectedToken.symbol} 暂不可在测试网兑换
            </Button>
          ) : needsApproval && sepoliaAddress ? (
            <GradientCTA
              loading={approve.isPending}
              disabled={!canSubmit}
              onClick={() =>
                approve.mutate({
                  token: sepoliaAddress,
                  spender: CONTRACTS.swapRouter,
                  amount: inputWei,
                })
              }
            >
              {approve.isPending
                ? `授权 ${selectedToken.symbol} 中…`
                : `授权 ${formatTokenAmount(inputWei, 18, 4)} ${selectedToken.symbol}`}
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
                    ? `余额不足，去 Stake 页面 faucet ${selectedToken.symbol}`
                    : swap.isPending
                      ? '签名 & 广播中…'
                      : `兑换 ${selectedToken.symbol} → pufETH`}
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
