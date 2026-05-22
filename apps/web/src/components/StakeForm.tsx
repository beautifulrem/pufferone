import { Button } from '@repo/ui/components/button'
import { Input } from '@repo/ui/components/input'
import { ArrowDownUp, CheckCircle2, ExternalLink, Info } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { parseEther, parseUnits, type Address } from 'viem'
import { useActivityLog } from '../hooks/useActivityLog'
import { useAllowance } from '../hooks/useAllowance'
import { useApprove } from '../hooks/useApprove'
import { useFaucet } from '../hooks/useFaucet'
import { useNativeBalance } from '../hooks/useNativeBalance'
import { useStakeERC20 } from '../hooks/useStakeERC20'
import { useStakeETH } from '../hooks/useStakeETH'
import { useSwap } from '../hooks/useSwap'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useUnstakeETH } from '../hooks/useUnstakeETH'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS, isDeployed } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { CornerBracketCard } from './CornerBracketCard'
import { GradientCTA } from './GradientCTA'
import { PercentChips } from './PercentChips'
import { SafetyProtectionsButton } from './SafetyProtectionsButton'
import { TokenIcon } from './TokenIcon'

type Direction = 'stake' | 'unstake'
type Token = 'ETH' | 'stETH' | 'wstETH'

/// 质押方向汇率（每 1 unit token 兑换的 pufETH × 100，跟合约 mock 一致）
const STAKE_RATE_BPS: Record<Token, bigint> = {
  ETH: 96n,
  stETH: 96n,
  wstETH: 112n,
}

/// 赎回方向汇率（每 1 pufETH 兑换的 token × 100）
/// - ETH 走 MockEthUnstake 合约（预存 ETH 储备，rate = 1.04e18）
/// - stETH/wstETH 走 MockSwapRouter 反向路径，rate 同步合约配置
const UNSTAKE_RATE_BPS: Record<Token, bigint> = {
  ETH: 104n,
  stETH: 104n,
  wstETH: 89n,
}

const TOKEN_ADDRESS: Record<Exclude<Token, 'ETH'>, Address> = {
  stETH: CONTRACTS.stETH,
  wstETH: CONTRACTS.wstETH,
}

/// Unstake 时滑点容忍度（链上 minOut 强制）。这里 hardcoded 50 bps = 0.5%。
/// 用户想自定义可去闪兑页用 SwapForm 的完整滑点控件。
const UNSTAKE_SLIPPAGE_BPS = 50

export type StakeFormProps = {
  /// 受控的 stake/unstake 方向。若不传则使用内部 state。
  direction?: Direction
  onDirectionChange?: (direction: Direction) => void
}

export function StakeForm({ direction: dirProp, onDirectionChange }: StakeFormProps = {}) {
  const wallet = useWallet()
  const [dirInner, setDirInner] = useState<Direction>('stake')
  const direction = dirProp ?? dirInner
  const setDirection = (d: Direction) => {
    if (onDirectionChange) onDirectionChange(d)
    else setDirInner(d)
  }
  const [token, setToken] = useState<Token>('ETH')
  const [amount, setAmount] = useState('')

  const isErc20 = token !== 'ETH'
  const tokenAddress = isErc20 ? TOKEN_ADDRESS[token] : undefined
  const isUnstakeETH = direction === 'unstake' && token === 'ETH'

  // —— 余额：stake 用 token 余额 (ETH/ERC20)，unstake 用 pufETH 余额 ——
  const ethBalance = useNativeBalance()
  const erc20Balance = useTokenBalance(direction === 'stake' && isErc20 ? tokenAddress : undefined)
  const pufETHBalance = useTokenBalance(direction === 'unstake' ? CONTRACTS.pufETH : undefined)

  // —— 授权：spender 取决于 direction + token ——
  // stake + ERC20  → depositor
  // unstake + ETH  → ethUnstake
  // unstake + LST  → swapRouter
  const unstakeSpender =
    direction === 'unstake'
      ? token === 'ETH'
        ? CONTRACTS.ethUnstake
        : CONTRACTS.swapRouter
      : undefined
  const stakeAllowance = useAllowance(
    direction === 'stake' && isErc20 ? tokenAddress : undefined,
    direction === 'stake' && isErc20 ? CONTRACTS.depositor : undefined,
  )
  const unstakeAllowance = useAllowance(
    direction === 'unstake' ? CONTRACTS.pufETH : undefined,
    unstakeSpender,
  )

  const stakeETH = useStakeETH()
  const stakeERC20 = useStakeERC20()
  const swap = useSwap()
  const unstakeETHMutation = useUnstakeETH()
  const approve = useApprove()
  const faucet = useFaucet()
  const log = useActivityLog()

  // 任一 mutation 成功后写一笔活动记录
  useEffect(() => {
    if (stakeETH.isSuccess && stakeETH.data) {
      log.add({
        type: 'stake',
        label: `质押 ${amount || '?'} ETH → ${formatTokenAmount(stakeETH.data.expectedPufETH, 18, 4)} pufETH`,
        txHash: stakeETH.data.txHash,
      })
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: log on success only
  }, [stakeETH.isSuccess])

  useEffect(() => {
    if (stakeERC20.isSuccess && stakeERC20.data) {
      log.add({
        type: 'stake',
        label: `质押 ${amount || '?'} ${token} → ${formatTokenAmount(stakeERC20.data.expectedPufETH, 18, 4)} pufETH`,
        txHash: stakeERC20.data.txHash,
      })
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: log on success only
  }, [stakeERC20.isSuccess])

  useEffect(() => {
    if (swap.isSuccess && swap.data) {
      log.add({
        type: 'unstake',
        label: `赎回 ${amount || '?'} pufETH → ${formatTokenAmount(swap.data.amountOut, 18, 4)} ${token}`,
        txHash: swap.data.txHash,
      })
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: log on success only
  }, [swap.isSuccess])

  useEffect(() => {
    if (unstakeETHMutation.isSuccess && unstakeETHMutation.data) {
      log.add({
        type: 'unstake',
        label: `赎回 ${amount || '?'} pufETH → ${formatTokenAmount(unstakeETHMutation.data.ethOut, 18, 4)} ETH`,
        txHash: unstakeETHMutation.data.txHash,
      })
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: log on success only
  }, [unstakeETHMutation.isSuccess])

  useEffect(() => {
    stakeETH.reset()
    stakeERC20.reset()
    swap.reset()
    unstakeETHMutation.reset()
    approve.reset()
    faucet.reset()
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on user change
  }, [direction, token, amount])

  const flip = () => {
    const next: Direction = direction === 'stake' ? 'unstake' : 'stake'
    setDirection(next)
    setAmount('')
    // unstake 不支持 ETH（合约 mock 没配 pufETH → native ETH 路径）
    if (next === 'unstake' && token === 'ETH') setToken('stETH')
  }

  const inputWei = useMemo(() => {
    if (!amount) return 0n
    try {
      return direction === 'stake' && token === 'ETH'
        ? parseEther(amount)
        : parseUnits(amount, 18)
    } catch {
      return 0n
    }
  }, [amount, direction, token])

  // —— 期望输出 ——
  const expectedOut = useMemo(() => {
    if (direction === 'stake') {
      return (inputWei * STAKE_RATE_BPS[token]) / 100n
    }
    const rate = UNSTAKE_RATE_BPS[token]
    return (inputWei * rate) / 100n
  }, [inputWei, direction, token])

  const minOut = useMemo(() => {
    if (direction === 'stake') return expectedOut // stake 走铸造合约，固定汇率无滑点
    return (expectedOut * BigInt(10_000 - UNSTAKE_SLIPPAGE_BPS)) / 10_000n
  }, [expectedOut, direction])

  // —— Balance / allowance 选择 ——
  const balanceAmount =
    direction === 'stake'
      ? isErc20
        ? (erc20Balance.data ?? 0n)
        : (ethBalance.data ?? 0n)
      : (pufETHBalance.data ?? 0n)

  const allowanceAmount =
    direction === 'stake' && isErc20
      ? (stakeAllowance.data ?? 0n)
      : direction === 'unstake'
        ? (unstakeAllowance.data ?? 0n)
        : 0n

  const insufficientBalance =
    (direction === 'unstake' || isErc20) && balanceAmount < inputWei

  const needsApproval =
    !insufficientBalance &&
    inputWei > 0n &&
    ((direction === 'stake' && isErc20) || direction === 'unstake') &&
    allowanceAmount < inputWei

  const isPending =
    stakeETH.isPending ||
    stakeERC20.isPending ||
    swap.isPending ||
    unstakeETHMutation.isPending ||
    approve.isPending ||
    faucet.isPending

  const txData =
    direction === 'stake'
      ? (stakeETH.data ?? stakeERC20.data ?? null)
      : token === 'ETH'
        ? (unstakeETHMutation.data ?? null)
        : (swap.data ?? null)
  const txError =
    direction === 'stake'
      ? (stakeETH.error ?? stakeERC20.error ?? null)
      : token === 'ETH'
        ? (unstakeETHMutation.error ?? null)
        : (swap.error ?? null)

  const canSubmit =
    isDeployed() &&
    wallet.isConnected &&
    wallet.isCorrectChain &&
    inputWei > 0n &&
    !insufficientBalance &&
    !isPending

  const handlePrimary = () => {
    if (direction === 'stake') {
      if (token === 'ETH') {
        stakeETH.mutate({ amountEth: amount })
      } else {
        stakeERC20.mutate({ token, amount })
      }
      return
    }
    // unstake
    if (token === 'ETH') {
      // pufETH → native ETH 通过 MockEthUnstake 合约（预存 ETH 储备）
      unstakeETHMutation.mutate({ amount })
      return
    }
    // pufETH → stETH/wstETH 通过 MockSwapRouter
    if (!tokenAddress) return
    swap.mutate({
      amount,
      path: [CONTRACTS.pufETH, tokenAddress] as readonly Address[],
      minAmountOut: minOut,
    })
  }

  // 保留 0.005 ETH 做 gas（仅 stake + ETH 时）
  const gasReserve = direction === 'stake' && token === 'ETH' ? parseEther('0.005') : 0n

  // —— UI 上的源 / 目标 token 信息 ——
  const sourceSymbol = direction === 'stake' ? token : 'pufETH'
  const targetSymbol = direction === 'stake' ? 'pufETH' : token
  const sourceLabel = direction === 'stake' ? '支付' : '赎回'
  const targetLabel = direction === 'stake' ? '预计收到' : '至少收到'
  const approveSpender =
    direction === 'stake'
      ? (tokenAddress ? CONTRACTS.depositor : undefined)
      : unstakeSpender
  const approveToken =
    direction === 'stake' ? tokenAddress : CONTRACTS.pufETH

  return (
    <div className="space-y-4">
      <CornerBracketCard className="p-5">
        {/* Direction tabs — 跟 MetaMask Swap / OKX Convert 一致的 stake / unstake 切换 */}
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-background/60 p-1">
          <button
            type="button"
            onClick={() => direction !== 'stake' && flip()}
            className={`rounded-md py-2 font-mono text-sm transition-all ${
              direction === 'stake'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-tertiary hover:text-foreground'
            }`}
          >
            质押
          </button>
          <button
            type="button"
            onClick={() => direction !== 'unstake' && flip()}
            className={`rounded-md py-2 font-mono text-sm transition-all ${
              direction === 'unstake'
                ? 'bg-primary text-primary-foreground'
                : 'text-text-tertiary hover:text-foreground'
            }`}
          >
            赎回
          </button>
        </div>

        {/* Token segmented */}
        <div className="mb-4 grid grid-cols-3 gap-1 rounded-lg bg-background/60 p-1">
          {(['ETH', 'stETH', 'wstETH'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setToken(t)}
              className={`flex items-center justify-center gap-1.5 rounded-md py-2 font-mono text-sm transition-all ${
                token === t
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-tertiary hover:text-foreground'
              }`}
            >
              <TokenIcon symbol={t} size={14} />
              {t}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="rounded-lg border border-border bg-background/40 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-text-tertiary text-xs">
            <span>{sourceLabel}</span>
            <span>
              余额{' '}
              <span className="text-foreground">{formatTokenAmount(balanceAmount, 18, 4)}</span>{' '}
              {sourceSymbol}
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
              <TokenIcon symbol={sourceSymbol} size={18} />
              {sourceSymbol}
            </div>
          </div>
          <div className="mt-3">
            <PercentChips balance={balanceAmount} onPick={setAmount} gasReserve={gasReserve} />
          </div>
        </div>

        {/* Flip 按钮 — MetaMask Swap 风格圆形 ↕ */}
        <div className="my-2 flex items-center justify-center">
          <button
            type="button"
            onClick={flip}
            aria-label="切换方向"
            className="group rounded-full border border-primary/40 bg-card p-2 text-primary transition-all hover:rotate-180 hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowDownUp size={14} />
          </button>
        </div>

        {/* Output row */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between font-mono text-text-tertiary text-xs">
            <span>{targetLabel}</span>
            <span className="text-text-tertiary">
              1 {sourceSymbol} ≈{' '}
              {direction === 'stake'
                ? (Number(STAKE_RATE_BPS[token]) / 100).toFixed(2)
                : (Number(UNSTAKE_RATE_BPS[token]) / 100).toFixed(2)}{' '}
              {targetSymbol}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <p className="flex-1 font-mono text-2xl text-foreground">
              <span className="text-primary">
                {formatTokenAmount(direction === 'unstake' && !isUnstakeETH ? minOut : expectedOut, 18, 6)}
              </span>
            </p>
            <div className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-card px-2 py-1 font-mono text-foreground text-xs">
              <TokenIcon symbol={targetSymbol} size={18} />
              {targetSymbol}
            </div>
          </div>
          {direction === 'stake' ? (
            <p className="mt-2 text-[11px] text-text-tertiary leading-relaxed">
              pufETH 数量少于 ETH，是因为它代表已包含未来收益的头寸；随着 Puffer 持续累积收益，pufETH 对 ETH 的赎回比例会逐步上升。
            </p>
          ) : isUnstakeETH ? (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-2.5">
              <Info size={12} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[11px] text-text-secondary-gray leading-relaxed">
                Sepolia 演示环境下走 PufferOne 的 mock unstake 合约即时兑付（合约预存了 ETH 储备）。主网生产实际走 PufferVault 官方提款队列，约 1–2 周到账 — 本演示压缩这一步以便完整体验。
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[11px] text-text-tertiary leading-relaxed">
              滑点 {(UNSTAKE_SLIPPAGE_BPS / 100).toFixed(2)}% 链上强制保护，若实际收到少于阈值会自动取消。
            </p>
          )}
        </div>

        {/* Faucet hint — 仅 stake 模式 */}
        {direction === 'stake' && isErc20 && tokenAddress && insufficientBalance && (
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
            ✓ 授权成功 · 现在确认{direction === 'stake' ? '存入' : '赎回'}
          </p>
        )}

        {/* Action */}
        <div className="mt-5">
          {needsApproval && approveToken && approveSpender ? (
            <GradientCTA
              loading={approve.isPending}
              disabled={!canSubmit}
              onClick={() =>
                approve.mutate({ token: approveToken, spender: approveSpender, amount: inputWei })
              }
            >
              {approve.isPending
                ? `第 1/2 步：授权 ${sourceSymbol} 中…`
                : `第 1/2 步：精确授权 ${formatTokenAmount(inputWei, 18, 4)} ${sourceSymbol}`}
            </GradientCTA>
          ) : (
            <GradientCTA loading={isPending} disabled={!canSubmit} onClick={handlePrimary}>
              {!isDeployed()
                ? '等待 Sepolia 部署'
                : !wallet.isConnected
                  ? '请先连接钱包'
                  : !wallet.isCorrectChain
                    ? '请切换到 Sepolia'
                    : insufficientBalance
                      ? direction === 'stake'
                        ? `余额不足，先 faucet ${token}`
                        : 'pufETH 余额不足'
                      : isPending
                        ? '签名 & 广播中…'
                        : direction === 'stake'
                          ? isErc20
                            ? `第 2/2 步：质押 ${token}`
                            : `质押 ${token} 铸造 pufETH`
                          : isUnstakeETH
                            ? `第 2/2 步：赎回为 ETH`
                            : `第 2/2 步：赎回为 ${token}`}
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
              <p className="font-mono font-semibold text-success text-sm">
                {direction === 'stake' ? '质押成功' : '赎回成功'}
              </p>
              <p className="mt-1 font-mono text-text-tertiary text-xs">
                收到{' '}
                <span className="text-primary">
                  {formatTokenAmount(
                    'expectedPufETH' in txData
                      ? txData.expectedPufETH
                      : 'amountOut' in txData
                        ? txData.amountOut
                        : 'ethOut' in txData
                          ? txData.ethOut
                          : 0n,
                    18,
                    6,
                  )}
                </span>{' '}
                {targetSymbol}
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

      <SafetyProtectionsButton />
    </div>
  )
}
