import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Wallet } from 'lucide-react'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppShell } from './components/layout/AppShell'
import { Login } from './pages/Login'
import { ResetPassword } from './pages/ResetPassword'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Categories } from './pages/Categories'
import { Planning } from './pages/Planning'
import { Settings } from './pages/Settings'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, session, passwordRecovery } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-sunken">
        <span className="flex h-12 w-12 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-br from-brand-pink to-brand-lilac text-white">
          <Wallet size={22} />
        </span>
      </div>
    )
  }

  if (passwordRecovery) {
    return <ResetPassword />
  }

  if (!session) {
    return <Login />
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
