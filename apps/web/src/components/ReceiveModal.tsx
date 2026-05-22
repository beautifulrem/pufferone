import { Button } from '@repo/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { Check, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { AddressAvatar } from './AddressAvatar'

/// QR code via api.qrserver.com — no extra dependency, works offline if user has cached
function qrUrl(text: string, size = 180): string {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    bgcolor: 'ffffff',
    color: '000000',
    margin: '8',
  })
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
}

export function ReceiveModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const wallet = useWallet()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  const address = wallet.address ?? ''

  const handleCopy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">收款</DialogTitle>
          <p className="mt-1 text-text-tertiary text-xs leading-relaxed">
            把下面的地址或二维码发给对方，TA 就能在 Sepolia 测试网给你转账。
          </p>
        </DialogHeader>

        {address ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center rounded-xl border border-border bg-white p-3">
              <img
                src={qrUrl(address)}
                alt="收款二维码"
                width={180}
                height={180}
                className="rounded-md"
              />
            </div>

            <div className="rounded-lg border border-border bg-background/40 p-3">
              <div className="mb-1.5 flex items-center gap-2">
                <AddressAvatar address={address} size={16} />
                <p className="font-mono text-text-tertiary text-[10px] uppercase tracking-wider">
                  你的地址
                </p>
              </div>
              <p className="break-all font-mono text-foreground text-xs leading-relaxed">
                {address}
              </p>
            </div>

            <Button onClick={handleCopy} className="w-full cta-gradient font-mono" size="lg">
              {copied ? (
                <>
                  <Check size={16} className="mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  复制地址
                </>
              )}
            </Button>

            <p className="text-center font-mono text-[10px] text-text-tertiary">
              仅接收 Sepolia 测试网代币，主网资产请使用主网地址。
            </p>
          </div>
        ) : (
          <p className="py-6 text-center text-text-tertiary text-sm">
            请先连接钱包才能查看你的收款地址。
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
