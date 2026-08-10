import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  session: Session | null
  userId: string | null
  loading: boolean
  error: string | null
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/**
 * Sem tela de login: usa Supabase Anonymous Auth para obter um auth.uid()
 * automaticamente, permitindo que as políticas de RLS (user_id = auth.uid())
 * funcionem sem exigir cadastro/login do usuário.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        if (mounted) {
          setSession(data.session)
          setLoading(false)
        }
        return
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously()
      if (!mounted) return
      if (signInError) {
        setError(signInError.message)
      } else {
        setSession(signInData.session)
      }
      setLoading(false)
    }

    bootstrap()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      mounted = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, userId: session?.user.id ?? null, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
