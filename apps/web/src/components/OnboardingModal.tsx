import { Button } from '@repo/ui/components/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'pufferone:onboarded'

type Step = {
  title: string
  body: string
  highlight: string
}

const STEPS: Step[] = [
  {
    title: '1 · What is restaking?',
    highlight: 'Stake once, earn twice.',
    body:
      'Restaking lets your already-staked ETH secure additional services beyond Ethereum consensus — extra yield, extra risk. PufferOne demonstrates the user-facing layer; the underlying validator economics live on Ethereum mainnet.',
  },
  {
    title: '2 · Why Puffer?',
    highlight: 'Validator-aligned, liquid, programmable.',
    body:
      'Puffer Finance is a leading liquid restaking protocol on Ethereum mainnet. Their pufETH token represents your ETH at work — earning validator rewards while staying liquid (transferable, usable in DeFi).',
  },
  {
    title: '3 · pufETH = your receipt',
    highlight: '1 ETH → ~0.96 pufETH (mainnet rate).',
    body:
      'When you stake, you receive pufETH at a slight discount. As validators earn rewards, the redemption rate (ETH per pufETH) grows — that growth is your yield. PufferOne uses a fixed 0.96 mock rate on Sepolia.',
  },
  {
    title: '4 · UniFi Vaults amplify yield',
    highlight: '4 vaults · different risk profiles · same pufETH input.',
    body:
      'unifiETH (5% APY, Low risk) · unifiUSD (4%, Low) · unifiBTC (5.5%, Medium) · pufETHs (7.5%, Elevated). All accept pufETH and return vault shares whose price appreciates over time.',
  },
  {
    title: '5 · You stay in control',
    highlight: '5 safety mechanisms before every signature.',
    body:
      'Every PufferOne transaction goes through: eth_call simulation → risk score → slippage minOut (DEX) → exact-amount approval (no infinite) → pre-sign summary with full contract address. You approve nothing you cannot see.',
  },
]

export function OnboardingModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY)
    if (!seen) {
      // Small delay so the page paints first
      const t = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  const handleClose = () => {
    window.localStorage.setItem(STORAGE_KEY, 'true')
    setOpen(false)
    setStep(0)
  }

  const isLast = step === STEPS.length - 1
  const current = STEPS[step]
  if (!current) return null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-mono text-foreground">
            Welcome to PufferOne
          </DialogTitle>
          <p className="mt-1 font-mono text-text-tertiary text-xs">
            Step {step + 1} of {STEPS.length} · skip to dive in
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
            <p className="font-mono font-semibold text-foreground text-base">
              {current.title}
            </p>
            <p className="mt-2 font-mono font-medium text-primary text-sm">
              {current.highlight}
            </p>
            <p className="mt-3 text-sm text-text-secondary-gray leading-relaxed">
              {current.body}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={`step-dot-${
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable position
                  i
                }`}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-primary' : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-text-tertiary"
              onClick={handleClose}
            >
              Skip onboarding
            </Button>

            <div className="flex gap-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono"
                  onClick={() => setStep((s) => s - 1)}
                >
                  Back
                </Button>
              )}
              <Button
                size="sm"
                className="font-mono"
                onClick={() => {
                  if (isLast) {
                    handleClose()
                  } else {
                    setStep((s) => s + 1)
                  }
                }}
              >
                {isLast ? "Let's go" : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
