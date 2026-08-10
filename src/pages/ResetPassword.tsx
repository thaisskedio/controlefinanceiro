import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Label, Input } from '../components/ui/Field'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function ResetPassword() {
  const { updatePassword, dismissPasswordRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setSubmitting(true)
    const { error } = await updatePassword(password)
    setSubmitting(false)
    if (error) setError(error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-pink to-brand-lilac text-white">
            <KeyRound size={20} />
          </span>
          <h1 className="text-lg font-semibold text-content">Definir nova senha</h1>
          <p className="text-center text-sm text-content-muted">Escolha uma nova senha para sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label>Nova senha</Label>
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
            <Label>Confirmar nova senha</Label>
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
            {submitting ? 'Salvando…' : 'Salvar nova senha'}
          </Button>
          <button
            type="button"
            onClick={dismissPasswordRecovery}
            className="text-center text-xs text-content-muted hover:text-content"
          >
            Cancelar
          </button>
        </form>
      </Card>
    </div>
  )
}
