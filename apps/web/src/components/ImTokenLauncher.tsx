import { Button } from '@repo/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { Check, Copy, ExternalLink, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

/// imToken DApp 浏览器深度链接：
/// imtokenv2://navigate/DAppView?url=<encoded>
function buildDeeplink(): string {
  const current = typeof window !== 'undefined' ? window.location.href : ''
  return `imtokenv2://navigate/DAppView?url=${encodeURIComponent(current)}`
}

/// 当前页 URL（用于二维码 / 复制）
function currentUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : ''
}

function qrUrl(text: string, size = 200): string {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    bgcolor: 'ffffff',
    color: '000000',
    margin: '8',
  })
  return `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
}

function isMobileUA(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipod|ipad|android|harmony/i.test(navigator.userAgent)
}

export function ImTokenLauncher() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    setMobile(isMobileUA())
  }, [])

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  const handleClick = () => {
    if (mobile) {
      // 移动端：尝试通过 location.href 触发 deeplink
      window.location.href = buildDeeplink()
    }
    // 不论桌面 / 移动都打开 dialog（移动端 deeplink 失败时作为 fallback）
    setOpen(true)
  }

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(currentUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
      >
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ background: 'rgba(56, 152, 252, 0.12)', color: 'rgb(56, 152, 252)' }}
        >
          <Smartphone size={20} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm">在 imToken 中打开</p>
          <p className="mt-0.5 text-text-tertiary text-xs leading-relaxed">
            手机扫码或一键跳到 imToken DApp 浏览器，体验真实钱包签名。
          </p>
        </div>
        <ExternalLink size={14} className="text-text-tertiary" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-foreground">在 imToken 中打开</DialogTitle>
            <p className="mt-1 text-text-tertiary text-xs leading-relaxed">
              {mobile
                ? '已尝试通过深度链接唤起 imToken App。如果没有自动跳转，请确认已安装 imToken。'
                : '用手机的 imToken 内置「扫一扫」扫描下方二维码，或将链接复制发送到手机。'}
            </p>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border border-border bg-white p-3">
              <img
                src={qrUrl(currentUrl())}
                alt="PufferOne 二维码"
                width={200}
                height={200}
                className="rounded-md"
              />
            </div>

            <div className="w-full rounded-lg border border-border bg-background/40 p-3">
              <p className="font-mono text-text-tertiary text-[10px] uppercase tracking-wider">
                当前页面链接
              </p>
              <p className="mt-1 break-all font-mono text-foreground text-xs leading-relaxed">
                {currentUrl()}
              </p>
            </div>

            <Button onClick={handleCopyUrl} className="cta-gradient w-full font-mono" size="lg">
              {copied ? (
                <>
                  <Check size={16} className="mr-2" />
                  已复制
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  复制链接
                </>
              )}
            </Button>

            {mobile && (
              <Button
                onClick={() => {
                  window.location.href = buildDeeplink()
                }}
                variant="outline"
                className="w-full font-mono"
                size="sm"
              >
                再次尝试唤起 imToken
              </Button>
            )}

            <p className="text-center font-mono text-[10px] text-text-tertiary">
              {mobile ? '若未安装' : '未安装可前往'}{' '}
              <a
                href="https://token.im/download"
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary hover:underline"
              >
                token.im/download
              </a>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
