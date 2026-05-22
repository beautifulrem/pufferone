import { Toaster } from '@repo/ui/components/sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { AppHeader } from '../components/AppHeader'
import { BottomTabNav } from '../components/BottomTabNav'
import { MobileShell } from '../components/MobileShell'
import { NetworkGuard } from '../components/NetworkGuard'
import { OnboardingModal } from '../components/OnboardingModal'
import { ThemeProvider } from '../hooks/useTheme'
import { WalletProvider } from '../hooks/useWallet'
import { queryClient } from '../lib/queryClient'
import { ExitPage } from '../pages/exit-page'
import { HomePage } from '../pages/home-page'
import { MorePage } from '../pages/more-page'
import { NotFoundPage } from '../pages/not-found-page'
import { StakePage } from '../pages/stake-page'
import { SwapPage } from '../pages/swap-page'
import { VaultsPage } from '../pages/vaults-page'

function AppLayout() {
  return (
    <MobileShell>
      <AppHeader />
      <NetworkGuard />
      <div className="px-4 pt-4">
        <Outlet />
      </div>
      <BottomTabNav />
      <Toaster />
      <OnboardingModal />
    </MobileShell>
  )
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<HomePage />} />
                <Route path="stake" element={<StakePage />} />
                <Route path="vaults" element={<VaultsPage />} />
                <Route path="swap" element={<SwapPage />} />
                <Route path="more" element={<MorePage />} />
                <Route path="exit" element={<ExitPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export { App }
