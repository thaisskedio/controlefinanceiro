import { useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CircularProgress } from '../components/ui/CircularProgress'
import { Input } from '../components/ui/Field'
import { useTransactions } from '../hooks/useTransactions'
import { useBudgetPlans, useUpsertBudgetPlan } from '../hooks/useBudgetPlans'
import { useCategories } from '../hooks/useCategories'
import { formatCurrency } from '../lib/format'
import { currentMonthInput, monthInputLabel, monthInputToRange } from '../lib/period'
import type { BudgetGroup } from '../types/database'

const GROUPS: { key: BudgetGroup; label: string }[] = [
  { key: 'expenses', label: 'Despesas' },
  { key: 'savings', label: 'Poupança' },
  { key: 'leisure', label: 'Lazer' },
  { key: 'emergency', label: 'Emergência' },
]

export function Planning() {
  const [month, setMonth] = useState(currentMonthInput())
  const period = `${month}-01`
  const { from, to } = monthInputToRange(month)

  const { data: categories = [] } = useCategories()
  const { data: transactions = [] } = useTransactions()
  const { data: plans = [] } = useBudgetPlans(period)
  const upsertPlan = useUpsertBudgetPlan(period)

  const periodTransactions = useMemo(
    () => transactions.filter((t) => t.due_date >= from && t.due_date <= to && t.status !== 'canceled'),
    [transactions, from, to],
  )

  // Mapeamento simples: categorias "fixed" -> grupo "expenses" quando é despesa;
  // sem uma coluna de budget_group em categories, usamos o nome/grupo da
  // categoria para aproximar "savings"/"leisure"/"emergency" via convenção de nome,
  // caindo em "expenses" como padrão para as demais despesas.
  const realizedByGroup = useMemo(() => {
    const totals: Record<BudgetGroup, number> = { expenses: 0, savings: 0, leisure: 0, emergency: 0 }
    for (const t of periodTransactions) {
      if (t.type !== 'expense') continue
      const categoryName = t.category?.name?.toLowerCase() ?? ''
      let group: BudgetGroup = 'expenses'
      if (categoryName.includes('poupan') || categoryName.includes('invest')) group = 'savings'
      else if (categoryName.includes('lazer') || categoryName.includes('viagem')) group = 'leisure'
      else if (categoryName.includes('emerg')) group = 'emergency'
      totals[group] += t.amount
    }
    return totals
  }, [periodTransactions])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm capitalize text-content-muted">{monthInputLabel(month)}</p>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2 text-sm text-content sm:w-auto"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GROUPS.map(({ key, label }) => {
          const plan = plans.find((p) => p.category_group === key)
          const planned = plan?.planned_amount ?? 0
          const realized = realizedByGroup[key]
          const pct = planned > 0 ? (realized / planned) * 100 : 0

          return (
            <Card key={key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-content">{label}</p>
                  <p className="text-xs text-content-muted">
                    {formatCurrency(realized)} de {formatCurrency(planned)}
                  </p>
                </div>
                <CircularProgress value={pct} size={72} strokeWidth={8} />
              </div>

              <ProgressBar value={pct} />

              <div className="flex items-center gap-2">
                <label className="text-xs text-content-muted">Planejado:</label>
                <Input
                  type="number"
                  step="0.01"
                  defaultValue={planned || ''}
                  placeholder="0,00"
                  className="max-w-[140px]"
                  onBlur={(e) => {
                    const value = Number(e.target.value)
                    if (!Number.isNaN(value) && value !== planned) {
                      upsertPlan.mutate({ categoryGroup: key, plannedAmount: value })
                    }
                  }}
                />
              </div>
            </Card>
          )
        })}
      </div>

      {categories.length === 0 && (
        <Card>
          <p className="text-sm text-content-muted">
            Cadastre categorias com nomes como "Poupança", "Lazer" ou "Emergência" para que os gastos sejam
            agrupados automaticamente nesses planejamentos.
          </p>
        </Card>
      )}
    </div>
  )
}
