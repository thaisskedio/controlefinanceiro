import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Field'
import { MonthNav } from '../components/ui/MonthNav'
import { TransactionRow } from '../components/transactions/TransactionRow'
import { TransactionFormModal } from '../components/transactions/TransactionFormModal'
import { TransactionActionsModal } from '../components/transactions/TransactionActionsModal'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { getEffectiveStatus } from '../lib/status'
import { currentMonthInput, monthInputToRange } from '../lib/period'
import type { TransactionStatus, TransactionType, TransactionWithCategory } from '../types/database'

export function Transactions() {
  const [month, setMonth] = useState(currentMonthInput())
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<TransactionWithCategory | null>(null)
  const [editing, setEditing] = useState<TransactionWithCategory | null>(null)

  const { from, to } = monthInputToRange(month)
  const { data: categories = [] } = useCategories()
  const { data: transactions = [], isLoading } = useTransactions({
    type: typeFilter || undefined,
    categoryId: categoryFilter || undefined,
    from,
    to,
  })

  const filtered = useMemo(
    () =>
      transactions
        .filter((t) => !statusFilter || getEffectiveStatus(t) === statusFilter)
        .sort((a, b) => (a.due_date < b.due_date ? 1 : -1)),
    [transactions, statusFilter],
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MonthNav month={month} onChange={setMonth} />
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Novo
        </Button>
      </div>

      <p className="text-sm text-content-muted">{filtered.length} lançamento(s)</p>

      <Card className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TransactionType | '')}>
          <option value="">Tipo</option>
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | '')}>
          <option value="">Status</option>
          <option value="paid">Pago</option>
          <option value="pending">Pendente</option>
          <option value="late">Atrasado</option>
          <option value="canceled">Cancelado</option>
        </Select>
        <Select
          className="col-span-2 lg:col-span-1"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </Card>

      <Card>
        {isLoading && <p className="py-8 text-center text-sm text-content-muted">Carregando…</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-content-muted">Nenhum lançamento neste período.</p>
        )}
        <div className="divide-y divide-border">
          {filtered.map((t) => (
            <TransactionRow key={t.id} transaction={t} onClick={() => setSelected(t)} />
          ))}
        </div>
      </Card>

      {showForm && <TransactionFormModal onClose={() => setShowForm(false)} />}
      {editing && <TransactionFormModal transaction={editing} onClose={() => setEditing(null)} />}
      {selected && (
        <TransactionActionsModal
          transaction={selected}
          onClose={() => setSelected(null)}
          onEdit={() => {
            setEditing(selected)
            setSelected(null)
          }}
        />
      )}
    </div>
  )
}
