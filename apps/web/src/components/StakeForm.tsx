import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, parseUnits, type Address } from 'viem'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useFaucet } from '../hooks/useFaucet'
import { useNativeBalance } from '../hooks/useNativeBalance'
import { useStakeERC20 } from '../hooks/useStakeERC20'
import { useStakeETH } from '../hooks/useStakeETH'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS, isDeployed } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { CornerBracketCard } from './CornerBracketCard'
import { GradientCTA } from './GradientCTA'
import { TokenIcon } from './TokenIcon'

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

export function StakeForm() {
  const wallet = useWallet()
  const [token, setToken] = useState<Token>('ETH')
  const [amount, setAmount] = useState('')

  const isErc20 = token !== 'ETH'
  const tokenAddress = isErc20 ? TOKEN_ADDRESS[token] : undefined
  const erc20Balance = useTokenBalance(tokenAddress)
  const ethBalance = useNativeBalance()
  const allowance = useAllowance(tokenAddress, isErc20 ? CONTRACTS.depositor : undefined)

  const stakeETH = useStakeETH()
  const stakeERC20 = useStakeERC20()
  const approve = useApprove()
  const faucet = useFaucet()

  useEffect(() => {
    stakeETH.reset()
    stakeERC20.reset()
    approve.reset()
    faucet.reset()
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

  const expectedPufETH = (inputWei * TOKEN_RATE[token]) / 100n
  const balanceAmount = isErc20 ? (erc20Balance.data ?? 0n) : (ethBalance.data ?? 0n)
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

  const setMax = () => {
    if (token === 'ETH') {
      // 保留 0.005 ETH 做 gas
      const reserve = parseEther('0.005')
      const usable = balanceAmount > reserve ? balanceAmount - reserve : 0n
      setAmount(formatTokenAmount(usable, 18, 6))
    } else {
      setAmount(formatTokenAmount(balanceAmount, 18, 6))
    }
  }

  return (
    <div className="space-y-4">
      <CornerBracketCard className="p-5">
        {/* Token segmented */}
        <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-background/60 p-1">
          {(['ETH', 'stETH', 'wstETH'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setToken(t)}
              className={`flex items-center justify-center rounded-md py-2 font-mono text-sm transition-all ${
                token === t
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-tertiary hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="rounded-lg border border-border bg-background/40 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-text-tertiary text-xs">
            <span>支付</span>
            <span>
              余额{' '}
              <span className="text-foreground">{formatTokenAmount(balanceAmount, 18, 4)}</span>{' '}
              {token}
              <button
                type="button"
                onClick={setMax}
                className="ml-2 rounded bg-primary/15 px-1.5 py-0.5 text-primary text-[10px] uppercase tracking-wider"
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
              className="h-12 flex-1 border-0 bg-transparent p-0 font-mono text-2xl text-foreground shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2 py-1 font-mono text-foreground text-xs">
              <TokenIcon symbol={token} size={18} />
              {token}
            </div>
          </div>
        </div>

        {/* Arrow + estimate */}
        <div className="my-2 flex items-center justify-center">
          <div className="rounded-full border border-primary/40 bg-card p-1.5 text-primary">↓</div>
        </div>

        {/* Output row */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-text-tertiary text-xs">
            <span>预计收到</span>
            <span className="text-text-tertiary">汇率 1 {token} = {TOKEN_RATE[token].toString()}% pufETH</span>
          </div>
          <div className="flex items-center gap-3">
            <p className="flex-1 font-mono text-2xl text-foreground">
              <span className="text-primary">{formatTokenAmount(expectedPufETH, 18, 6)}</span>
            </p>
            <div className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-card px-2 py-1 font-mono text-foreground text-xs">
              <TokenIcon symbol="pufETH" size={18} />
              pufETH
            </div>
          </div>
        </div>

        {/* Faucet hint */}
        {isErc20 && tokenAddress && insufficientBalance && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-warning/40 bg-warning-surface px-3 py-2">
            <div>
              <p className="font-mono text-foreground text-xs">没有 {token}？</p>
              <p className="font-mono text-[10px] text-text-tertiary">
                Mock 合约带 faucet（每次最多 100 个）
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 font-mono text-xs"
              disabled={faucet.isPending}
              onClick={() => faucet.mutate({ token: tokenAddress, amount: '100' })}
            >
              {faucet.isPending ? '铸造中…' : `领 100 ${token}`}
            </Button>
          </div>
        )}

        {/* Errors */}
        {txError && (
          <p className="mt-3 font-mono text-destructive text-xs">
            ❌ {'reason' in txError ? txError.reason : txError.kind}
          </p>
        )}

        {approve.isSuccess && !txData && (
          <p className="mt-3 font-mono text-success text-xs">
            ✓ 授权成功 · 现在确认存入
          </p>
        )}

        {/* Action */}
        <div className="mt-5">
          {needsApproval && tokenAddress ? (
            <GradientCTA
              loading={approve.isPending}
              disabled={!canSubmit}
              onClick={() =>
                approve.mutate({ token: tokenAddress, spender: CONTRACTS.depositor, amount: inputWei })
              }
            >
              {approve.isPending
                ? `第 1/2 步：授权 ${token} 中…`
                : `第 1/2 步：精确授权 ${formatTokenAmount(inputWei, 18, 4)} ${token}`}
            </GradientCTA>
          ) : (
            <GradientCTA
              loading={isPending}
              disabled={!canSubmit}
              onClick={handlePrimary}
            >
              {!isDeployed()
                ? '等待 Sepolia 部署'
                : !wallet.isConnected
                  ? '请先连接钱包'
                  : !wallet.isCorrectChain
                    ? '请切换到 Sepolia'
                    : insufficientBalance
                      ? `余额不足，先 faucet ${token}`
                      : isPending
                        ? '签名 & 广播中…'
                        : isErc20
                          ? `第 2/2 步：质押 ${token}`
                          : `质押 ${token} 铸造 pufETH`}
            </GradientCTA>
          )}
        </div>
      </CornerBracketCard>

      {/* TX Success */}
      {txData && (
        <CornerBracketCard className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <p className="font-mono font-semibold text-success text-sm">质押成功</p>
              <p className="mt-1 font-mono text-text-tertiary text-xs">
                收到 <span className="text-primary">{formatTokenAmount(txData.expectedPufETH, 18, 6)}</span> pufETH
              </p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txData.txHash}`}
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

      {/* Safety chips strip */}
      <div className="flex flex-wrap gap-1.5 px-1 font-mono text-[10px]">
        <span className="rounded-full bg-card px-2 py-1 text-text-tertiary">✓ eth_call 模拟</span>
        <span className="rounded-full bg-card px-2 py-1 text-text-tertiary">✓ 精确授权</span>
        <span className="rounded-full bg-card px-2 py-1 text-text-tertiary">✓ 全地址显示</span>
        <span className="rounded-full bg-card px-2 py-1 text-text-tertiary">✓ 风险评分</span>
        <span className="rounded-full bg-card px-2 py-1 text-text-tertiary">✓ 签前总结</span>
      </div>

      {/* Contract footer */}
      <p className="font-mono text-[10px] text-text-tertiary">
        合约 <span className="neon-cyan break-all">{CONTRACTS.depositor}</span>
      </p>
    </div>
  )
}
