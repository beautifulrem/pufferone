import { Toaster } from '@repo/ui/components/sonner'
import { useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { AppHeader } from '../components/AppHeader'
import { NetworkGuard } from '../components/NetworkGuard'
import { WalletProvider } from '../hooks/useWallet'
import { HomePage } from '../pages/home-page'

function AppLayout() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  return (
    <main className="min-h-screen bg-surface-page text-foreground">
      <div className="relative isolate">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="-z-10 -translate-x-1/2 pointer-events-none absolute top-[-20%] left-1/2 h-[600px] w-[800px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgb(0 229 199 / 0.4) 0%, rgb(0 229 199 / 0) 70%)',
          }}
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <AppHeader />
          <NetworkGuard />
          <Outlet />
        </div>
      </div>
      <Toaster />
    </main>
  )
}

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  )
}

export { App }
