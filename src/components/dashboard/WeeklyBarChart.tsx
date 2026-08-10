import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { TransactionWithCategory } from '../../types/database'
import { formatCurrency } from '../../lib/format'

export function WeeklyBarChart({ transactions }: { transactions: TransactionWithCategory[] }) {
  const buckets = new Map<number, { week: string; despesas: number; receitas: number }>()

  for (const t of transactions) {
    if (t.status === 'canceled') continue
    const day = Number(t.due_date.slice(8, 10))
    const weekIndex = Math.floor((day - 1) / 7)
    const label = `Sem ${weekIndex + 1}`
    const bucket = buckets.get(weekIndex) ?? { week: label, despesas: 0, receitas: 0 }
    if (t.type === 'expense') bucket.despesas += t.amount
    else bucket.receitas += t.amount
    buckets.set(weekIndex, bucket)
  }

  const data = Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([, v]) => v)

  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-content-muted">
        Sem lançamentos no período selecionado.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={6}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis dataKey="week" tickLine={false} axisLine={false} className="text-xs fill-content-muted" />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          className="text-xs fill-content-muted"
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace('.0', '')}k` : `${v}`)}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid rgb(var(--color-border))',
            background: 'rgb(var(--color-surface-raised))',
            color: 'rgb(var(--color-content))',
          }}
        />
        <Bar dataKey="despesas" fill="rgb(var(--color-pink))" radius={[6, 6, 0, 0]} />
        <Bar dataKey="receitas" fill="rgb(var(--color-teal))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
