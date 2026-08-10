import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Categories } from './pages/Categories'
import { Planning } from './pages/Planning'
import { Settings } from './pages/Settings'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, error } = useAuth()

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-6 text-center">
        <div>
          <p className="mb-2 text-sm font-medium text-status-late">Não foi possível conectar ao Supabase</p>
          <p className="text-xs text-content-muted">{error}</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-brand-pink to-brand-lilac text-white">
          <Wallet size={22} />
        </span>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate>
            <BrowserRouter>
              <AppShell>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/lancamentos" element={<Transactions />} />
                  <Route path="/categorias" element={<Categories />} />
                  <Route path="/planejamento" element={<Planning />} />
                  <Route path="/configuracoes" element={<Settings />} />
                </Routes>
              </AppShell>
            </BrowserRouter>
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
