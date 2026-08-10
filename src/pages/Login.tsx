import { useState, type FormEvent } from 'react'
import { Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Label, Input } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function Login() {
  const { signIn, sendPasswordReset } = useAuth()
  const [mode, setMode] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setError('E-mail ou senha inválidos.')
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const { error } = await sendPasswordReset(email)
    setSubmitting(false)
    if (error) {
      setError(error)
    } else {
      setInfo('Se esse e-mail tiver uma conta, enviamos um link para redefinir a senha.')
    }
  }

  function switchMode(next: 'login' | 'forgot') {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-pink to-brand-lilac text-white">
            <Wallet size={20} />
          </span>
          <h1 className="text-lg font-semibold text-content">Controle Financeiro</h1>
          <p className="text-sm text-content-muted">
            {mode === 'login' ? 'Entre com sua conta para continuar' : 'Recuperar senha'}
          </p>
        </div>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-status-late">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
            <button
              type="button"
              onClick={() => switchMode('forgot')}
              className="text-center text-xs text-content-muted hover:text-content"
            >
              Esqueci minha senha
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
              />
            </div>

            {error && <p className="text-xs text-status-late">{error}</p>}
            {info && <p className="text-xs text-status-paid">{info}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Enviando…' : 'Enviar link de recuperação'}
            </Button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-center text-xs text-content-muted hover:text-content"
            >
              Voltar para o login
            </button>
          </form>
        )}
      </Card>
    </div>
  )
}
