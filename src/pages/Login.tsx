import { useState, type FormEvent } from 'react'
import { Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Label, Input } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error } = await signIn(email, password)
    setSubmitting(false)
    if (error) setError('E-mail ou senha inválidos.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-pink to-brand-lilac text-white">
            <Wallet size={20} />
          </span>
          <h1 className="text-lg font-semibold text-content">Controle Financeiro</h1>
          <p className="text-sm text-content-muted">Entre com sua conta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
        </form>
      </Card>
    </div>
  )
}
