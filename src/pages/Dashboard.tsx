import { useMemo, useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { Card } from '../components/ui/Card'
import { TransactionRow } from '../components/transactions/TransactionRow'
import { WeeklyBarChart } from '../components/dashboard/WeeklyBarChart'
import { formatCurrency } from '../lib/format'
import { currentMonthInput, monthInputLabel, monthInputToRange } from '../lib/period'
import { getEffectiveStatus } from '../lib/status'

export function Dashboard() {
  const [month, setMonth] = useState(currentMonthInput())
  const { from, to } = monthInputToRange(month)

  const { data: allTransactions = [], isLoading } = useTransactions()
  const periodTransactions = useMemo(
    () => allTransactions.filter((t) => t.due_date >= from && t.due_date <= to),
    [allTransactions, from, to],
  )

  const saldoAtual = useMemo(
    () =>
      allTransactions
        .filter((t) => t.status === 'paid')
        .reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0),
    [allTransactions],
  )

  const aPagarNoMes = useMemo(
    () =>
      periodTransactions
        .filter((t) => t.type === 'expense' && ['pending', 'late'].includes(getEffectiveStatus(t)))
        .reduce((acc, t) => acc + t.amount, 0),
    [periodTransactions],
  )

  const pagoNoMes = useMemo(
    () =>
      periodTransactions.filter((t) => t.status === 'paid').reduce((acc, t) => acc + t.amount, 0),
    [periodTransactions],
  )

  const recentes = useMemo(
    () => [...periodTransactions].sort((a, b) => (a.due_date < b.due_date ? 1 : -1)).slice(0, 8),
    [periodTransactions],
  )

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm capitalize text-content-muted">{monthInputLabel(month)}</p>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm text-content sm:w-auto"
        />
      </div>

      <Card className="bg-gradient-to-br from-brand-teal to-brand-tealDark text-white">
        <p className="text-sm text-white/80">Saldo atual</p>
        <p className="mt-1 text-3xl font-semibold sm:text-4xl">{formatCurrency(saldoAtual)}</p>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-content-muted">A pagar no mês</p>
          <p className="mt-1 text-2xl font-semibold text-status-late">{formatCurrency(aPagarNoMes)}</p>
        </Card>
        <Card>
          <p className="text-sm text-content-muted">Pago no mês</p>
          <p className="mt-1 text-2xl font-semibold text-status-paid">{formatCurrency(pagoNoMes)}</p>
        </Card>
      </div>

      <Card>
        <p className="mb-2 text-sm font-medium text-content">Despesas x receitas por semana</p>
        <WeeklyBarChart transactions={periodTransactions} />
      </Card>

      <Card>
        <p className="mb-1 text-sm font-medium text-content">Últimos lançamentos</p>
        {isLoading && <p className="py-6 text-center text-sm text-content-muted">Carregando…</p>}
        {!isLoading && recentes.length === 0 && (
          <p className="py-6 text-center text-sm text-content-muted">Nenhum lançamento neste período.</p>
        )}
        <div className="divide-y divide-border">
          {recentes.map((t) => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
        </div>
      </Card>
    </div>
  )
}
