import { useState } from 'react'
import { LogOut, Moon, Sun } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Field'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useAccountSettings, useSetInitialBalance } from '../hooks/useAccountSettings'

const PALETTE = [
  { name: 'Rosa', hex: '#F472B6' },
  { name: 'Rosa escuro', hex: '#EC4899' },
  { name: 'Lilás', hex: '#A78BFA' },
  { name: 'Lilás claro', hex: '#C4B5FD' },
  { name: 'Azul petróleo', hex: '#0F4C5C' },
  { name: 'Azul petróleo escuro', hex: '#134E5E' },
]

export function Settings() {
  const { theme, setTheme } = useTheme()
  const { session, signOut } = useAuth()
  const { data: accountSettings, isLoading: loadingBalance } = useAccountSettings()
  const setInitialBalance = useSetInitialBalance()
  const [balanceSaved, setBalanceSaved] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="mb-3 text-sm font-medium text-content">Conta</p>
        <p className="mb-3 text-xs text-content-muted">{session?.user.email}</p>
        <Button variant="secondary" onClick={() => signOut()}>
          <LogOut size={16} /> Sair
        </Button>
      </Card>

      <Card>
        <p className="mb-1 text-sm font-medium text-content">Saldo inicial</p>
        <p className="mb-3 text-xs text-content-muted">
          Valor somado ao saldo atual (ex: o que você já tinha antes de começar a usar o app). Não altera
          nenhum lançamento já cadastrado, só o cálculo do saldo.
        </p>
        {!loadingBalance && (
          <div className="flex items-center gap-2">
            <Input
              key={accountSettings?.initial_balance ?? 'empty'}
              type="number"
              step="0.01"
              defaultValue={accountSettings?.initial_balance ?? ''}
              placeholder="0,00"
              className="max-w-[180px]"
              onBlur={(e) => {
                const value = Number(e.target.value)
                setBalanceSaved(false)
                if (!Number.isNaN(value) && value !== (accountSettings?.initial_balance ?? 0)) {
                  setInitialBalance.mutate(value, { onSuccess: () => setBalanceSaved(true) })
                }
              }}
            />
            {balanceSaved && <span className="text-xs text-status-paid">Salvo</span>}
          </div>
        )}
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-content">Tema</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              theme === 'light' ? 'border-brand-lilac bg-brand-lilac/10' : 'border-border'
            }`}
          >
            <Sun size={20} className="text-content" />
            <span className="text-sm text-content">Claro</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              theme === 'dark' ? 'border-brand-lilac bg-brand-lilac/10' : 'border-border'
            }`}
          >
            <Moon size={20} className="text-content" />
            <span className="text-sm text-content">Escuro</span>
          </button>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-content">Paleta de cores</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PALETTE.map((c) => (
            <div key={c.hex} className="flex items-center gap-2 rounded-xl border border-border p-3">
              <span className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: c.hex }} />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-content">{c.name}</p>
                <p className="truncate text-[11px] text-content-muted">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-content">Sobre</p>
        <p className="mt-1 text-xs text-content-muted">
          Controle Financeiro — registro de despesas, receitas, parcelamentos e planejamento orçamentário.
        </p>
      </Card>
    </div>
  )
}
