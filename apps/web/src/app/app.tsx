import { Toaster } from '@repo/ui/components/sonner'
import { useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router'
import { HomePage } from '../pages/home-page'

function AppLayout() {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    document.documentElement.style.colorScheme = 'dark'
  }, [])

  return (
    <main className="min-h-screen bg-surface-page text-foreground">
      <Outlet />
      <Toaster />
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export { App }
