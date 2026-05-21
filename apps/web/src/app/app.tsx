import { Toaster } from '@repo/ui/components/sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { BrowserRouter, Link, Outlet, Route, Routes } from 'react-router'
import { AppHeader } from '../components/AppHeader'
import { NetworkGuard } from '../components/NetworkGuard'
import { OnboardingModal } from '../components/OnboardingModal'
import { WalletProvider } from '../hooks/useWallet'
import { queryClient } from '../lib/queryClient'
import { HomePage } from '../pages/home-page'
import { StakePage } from '../pages/stake-page'
import { PortfolioPage } from '../pages/portfolio-page'
import { SwapPage } from '../pages/swap-page'
import { VaultsPage } from '../pages/vaults-page'

function AppLayout() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  return (
    <main className="min-h-screen bg-surface-page text-foreground">
      <div className="relative isolate">
        <div
          aria-hidden
          className="-z-10 -translate-x-1/2 pointer-events-none absolute top-[-20%] left-1/2 h-[600px] w-[800px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgb(0 229 199 / 0.4) 0%, rgb(0 229 199 / 0) 70%)',
          }}
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <AppHeader />
          <nav className="mb-8 flex gap-1 font-mono text-sm">
            <Link
              to="/"
              className="rounded-md border border-transparent px-3 py-1.5 text-text-tertiary transition-colors hover:border-border hover:text-foreground"
            >
              Home
            </Link>
            <Link
              to="/stake"
              className="rounded-md border border-transparent px-3 py-1.5 text-text-tertiary transition-colors hover:border-border hover:text-foreground"
            >
              Stake
            </Link>
            <Link
              to="/vaults"
              className="rounded-md border border-transparent px-3 py-1.5 text-text-tertiary transition-colors hover:border-border hover:text-foreground"
            >
              Vaults
            </Link>
            <Link
              to="/swap"
              className="rounded-md border border-transparent px-3 py-1.5 text-text-tertiary transition-colors hover:border-border hover:text-foreground"
            >
              Swap
            </Link>
            <Link
              to="/portfolio"
              className="rounded-md border border-transparent px-3 py-1.5 text-text-tertiary transition-colors hover:border-border hover:text-foreground"
            >
              Portfolio
            </Link>
          </nav>
          <NetworkGuard />
          <Outlet />
        </div>
      </div>
      <Toaster />
      <OnboardingModal />
    </main>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="stake" element={<StakePage />} />
              <Route path="vaults" element={<VaultsPage />} />
              <Route path="swap" element={<SwapPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </QueryClientProvider>
  )
}

export { App }
