import { useState, type FormEvent } from 'react'
import { Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Label, Input } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

type Mode = 'login' | 'signup' | 'forgot'

const MODE_SUBTITLE: Record<Mode, string> = {
  login: 'Entre com sua conta para continuar',
  signup: 'Crie sua conta',
  forgot: 'Recuperar senha',
}

export function Login() {
  const { signIn, signUp, sendPasswordReset } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setError('E-mail ou senha inválidos.')
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!name.trim()) {
      setError('Informe seu nome.')
      return
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setSubmitting(true)
    const { error, needsConfirmation } = await signUp(email, password, name.trim())
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    if (needsConfirmation) {
      setMode('login')
      setInfo('Conta criada! Verifique seu e-mail para confirmar antes de entrar.')
    }
    // Se não precisar de confirmação, a sessão já foi criada e o app libera o acesso sozinho.
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-pink to-brand-lilac text-white">
            <Wallet size={20} />
          </span>
          <h1 className="text-lg font-semibold text-content">Controle Financeiro</h1>
          <p className="text-sm text-content-muted">{MODE_SUBTITLE[mode]}</p>
        </div>

        {mode === 'login' && (
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
            {info && <p className="text-xs text-status-paid">{info}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Entrando…' : 'Entrar'}
            </Button>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-center text-xs text-content-muted hover:text-content"
              >
                Esqueci minha senha
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-center text-xs text-content-muted hover:text-content"
              >
                Não tem conta? <span className="font-medium text-brand-lilacDark">Criar conta</span>
              </button>
            </div>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div>
              <Label>Nome</Label>
              <Input
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
              />
            </div>
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
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label>Confirmar senha</Label>
              <Input
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-status-late">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Criando conta…' : 'Criar conta'}
            </Button>
            <button
              type="button"
              onClick={() => switchMode('login')}
              className="text-center text-xs text-content-muted hover:text-content"
            >
              Já tenho conta
            </button>
          </form>
        )}

        {mode === 'forgot' && (
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
