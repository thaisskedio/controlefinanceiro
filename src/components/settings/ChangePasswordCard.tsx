import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { Card } from '../ui/Card'
import { Label, Input } from '../ui/Field'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

export function ChangePasswordCard() {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

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
    if (error) {
      setError(error)
      return
    }
    setSuccess('Senha alterada com sucesso.')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <KeyRound size={16} className="text-brand-lilacDark" />
        <p className="text-sm font-medium text-content">Alterar senha</p>
      </div>
      <p className="mb-3 text-xs text-content-muted">Define uma nova senha para sua conta.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Nova senha</Label>
            <Input
              type="password"
              autoComplete="new-password"
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
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="text-xs text-status-late">{error}</p>}
        {success && <p className="text-xs text-status-paid">{success}</p>}

        <Button type="submit" disabled={submitting} className="w-fit">
          {submitting ? 'Salvando…' : 'Alterar senha'}
        </Button>
      </form>
    </Card>
  )
}
