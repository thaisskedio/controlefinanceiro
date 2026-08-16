import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { TransactionWithCategory } from '../../types/database'
import { formatCurrency } from '../../lib/format'

const NO_CATEGORY_COLOR = '#94A3B8'

export function CategoryBreakdown({ transactions }: { transactions: TransactionWithCategory[] }) {
  const data = useMemo(() => {
    const totals = new Map<string, { name: string; color: string; value: number }>()

    for (const t of transactions) {
      if (t.type !== 'expense' || t.status === 'canceled') continue
      const key = t.category_id ?? 'sem-categoria'
      const name = t.category?.name ?? 'Sem categoria'
      const color = t.category?.color ?? NO_CATEGORY_COLOR
      const entry = totals.get(key) ?? { name, color, value: 0 }
      entry.value += t.amount
      totals.set(key, entry)
    }

    return Array.from(totals.values()).sort((a, b) => b.value - a.value)
  }, [transactions])

  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-content-muted">
        Nenhuma despesa neste período.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="mx-auto w-full max-w-[220px] sm:mx-0 sm:w-[220px] sm:shrink-0">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(Number(value)), name]}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid rgb(var(--color-border))',
                background: 'rgb(var(--color-surface-raised))',
                color: 'rgb(var(--color-content))',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="min-w-0 flex-1 divide-y divide-border">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-3 py-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="min-w-0 flex-1 truncate text-sm text-content">{entry.name}</span>
            <span className="shrink-0 text-xs text-content-muted">
              {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
            </span>
            <span className="shrink-0 text-sm font-medium text-content">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
