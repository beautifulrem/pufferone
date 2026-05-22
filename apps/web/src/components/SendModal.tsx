import { Button } from '@repo/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { Input } from '@repo/ui/components/input'
import { Label } from '@repo/ui/components/label'
import { AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { isAddress, parseUnits, type Address } from 'viem'
import { useTokenBalance } from '../hooks/useTokenBalance'
import { useTransfer } from '../hooks/useTransfer'
import { useWallet } from '../hooks/useWallet'
import { CONTRACTS } from '../lib/contracts'
import { formatTokenAmount } from '../lib/format'
import { AddressAvatar } from './AddressAvatar'
import { PercentChips } from './PercentChips'
import { TokenIcon } from './TokenIcon'

type SendTokenKey = 'pufETH' | 'stETH' | 'wstETH'

const SEND_TOKENS: { key: SendTokenKey; symbol: string; address: Address }[] = [
  { key: 'pufETH', symbol: 'pufETH', address: CONTRACTS.pufETH },
  { key: 'stETH', symbol: 'stETH', address: CONTRACTS.stETH },
  { key: 'wstETH', symbol: 'wstETH', address: CONTRACTS.wstETH },
]

export function SendModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const wallet = useWallet()
  const [tokenKey, setTokenKey] = useState<SendTokenKey>('pufETH')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const transfer = useTransfer()

  const selectedToken =
    SEND_TOKENS.find((t) => t.key === tokenKey) ?? SEND_TOKENS[0]!
  const balance = useTokenBalance(selectedToken.address)

  // 重置时清空 form
  useEffect(() => {
    if (!open) {
      setRecipient('')
      setAmount('')
      transfer.reset()
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: only on open change
  }, [open])

  const inputWei = useMemo(() => {
    if (!amount) return 0n
    try {
      return parseUnits(amount, 18)
    } catch {
      return 0n
    }
  }, [amount])

  const balanceAmount = balance.data ?? 0n
  const insufficient = balanceAmount < inputWei
  const isValidAddress = recipient !== '' && isAddress(recipient)
  const isSelfTransfer =
    isValidAddress && wallet.address?.toLowerCase() === recipient.toLowerCase()

  const canSubmit =
    wallet.isConnected &&
    wallet.isCorrectChain &&
    isValidAddress &&
    inputWei > 0n &&
    !insufficient &&
    !transfer.isPending

  const handleSend = () => {
    if (!isValidAddress) return
    transfer.mutate({
      token: selectedToken.address,
      to: recipient as Address,
      amount: inputWei,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">发送</DialogTitle>
          <p className="mt-1 text-text-tertiary text-xs leading-relaxed">
            将持有的代币转给任意地址。仅支持 Sepolia 测试网，主网请勿使用此演示。
          </p>
        </DialogHeader>

        {!wallet.isConnected ? (
          <p className="py-6 text-center text-text-tertiary text-sm">
            请先连接钱包后再发送。
          </p>
        ) : transfer.isSuccess && transfer.data ? (
          <div className="space-y-3 rounded-lg border border-success/30 bg-success/5 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success" />
              <p className="font-semibold text-success-text">发送成功</p>
            </div>
            <p className="text-foreground text-sm">
              已向{' '}
              <span className="font-mono">{shortAddress(transfer.data.to)}</span> 发送{' '}
              <span className="font-mono text-primary">
                {formatTokenAmount(transfer.data.amount)} {selectedToken.symbol}
              </span>
              。
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${transfer.data.txHash}`}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 font-mono text-primary text-xs hover:underline"
            >
              Etherscan 查看 <ExternalLink size={11} />
            </a>
            <Button
              variant="outline"
              size="sm"
              className="w-full font-mono"
              onClick={() => onOpenChange(false)}
            >
              关闭
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Token 选择 */}
            <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-background/60 p-1">
              {SEND_TOKENS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTokenKey(t.key)}
                  className={`flex items-center justify-center gap-1.5 rounded-md py-2 font-mono text-sm transition-all ${
                    tokenKey === t.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-text-tertiary hover:text-foreground'
                  }`}
                >
                  <TokenIcon symbol={t.symbol} size={14} />
                  {t.symbol}
                </button>
              ))}
            </div>

            {/* 接收地址 */}
            <div className="space-y-1.5">
              <Label className="text-text-tertiary text-xs uppercase tracking-wide">
                接收地址
              </Label>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2 focus-within:border-primary/50">
                {isValidAddress && <AddressAvatar address={recipient} size={16} />}
                <Input
                  type="text"
                  placeholder="0x…"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value.trim())}
                  className="h-7 flex-1 border-0 bg-transparent p-0 font-mono text-foreground text-sm shadow-none focus-visible:ring-0"
                />
              </div>
              {recipient !== '' && !isValidAddress && (
                <p className="font-mono text-destructive text-xs">地址格式无效，应以 0x 开头并为 40 位十六进制</p>
              )}
              {isSelfTransfer && (
                <div className="flex items-start gap-1.5 rounded-md border border-warning/30 bg-warning/5 px-2 py-1.5 text-warning-text text-xs">
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  <span>这是你自己的地址，确认无误后再发送</span>
                </div>
              )}
            </div>

            {/* 数量 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-text-tertiary text-xs uppercase tracking-wide">
                  数量
                </Label>
                <span className="font-mono text-text-tertiary text-[10px]">
                  余额{' '}
                  <span className="text-foreground">
                    {formatTokenAmount(balanceAmount, 18, 4)}
                  </span>{' '}
                  {selectedToken.symbol}
                </span>
              </div>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 border-border bg-background/40 font-mono"
              />
              <PercentChips balance={balanceAmount} onPick={setAmount} />
              {insufficient && inputWei > 0n && (
                <p className="font-mono text-destructive text-xs">余额不足</p>
              )}
            </div>

            {/* 错误 */}
            {transfer.error && (
              <p className="font-mono text-destructive text-xs">{transfer.error.message}</p>
            )}

            <Button
              size="lg"
              disabled={!canSubmit}
              onClick={handleSend}
              className="cta-gradient w-full font-mono"
            >
              {!wallet.isCorrectChain
                ? '请切换到 Sepolia'
                : transfer.isPending
                  ? '发送中…'
                  : `发送 ${selectedToken.symbol}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function shortAddress(a: string): string {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}
