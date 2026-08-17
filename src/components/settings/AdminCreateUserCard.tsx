import { useState, type FormEvent } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Card } from '../ui/Card'
import { Label, Input } from '../ui/Field'
import { Button } from '../ui/Button'
import { useCreateInternalUser } from '../../hooks/useAdminUsers'

export function AdminCreateUserCard() {
  const createUser = useCreateInternalUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError('Informe o nome.')
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

    try {
      const user = await createUser.mutateAsync({ email, password, name: name.trim() })
      setSuccess(`Usuário ${user?.email} criado e já confirmado.`)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário.')
    }
  }

  return (
    <Card>
      <div className="mb-1 flex items-center gap-2">
        <ShieldCheck size={16} className="text-brand-lilacDark" />
        <p className="text-sm font-medium text-content">Criar usuário interno</p>
      </div>
      <p className="mb-3 text-xs text-content-muted">
        Cria a conta já confirmada, sem enviar e-mail de verificação. Só você (admin) vê esta seção.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome da pessoa" />
        </div>
        <div>
          <Label>E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pessoa@email.com"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Senha</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <Label>Confirmar senha</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && <p className="text-xs text-status-late">{error}</p>}
        {success && <p className="text-xs text-status-paid">{success}</p>}

        <Button type="submit" disabled={createUser.isPending} className="w-fit">
          {createUser.isPending ? 'Criando…' : 'Criar usuário'}
        </Button>
      </form>
    </Card>
  )
}
