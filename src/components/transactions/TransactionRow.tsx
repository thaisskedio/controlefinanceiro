import clsx from 'clsx'
import type { TransactionWithCategory } from '../../types/database'
import { formatCurrency, formatDate } from '../../lib/format'
import { getEffectiveStatus } from '../../lib/status'
import { StatusBadge } from '../ui/StatusBadge'

export function TransactionRow({
  transaction,
  onClick,
}: {
  transaction: TransactionWithCategory
  onClick?: () => void
}) {
  const status = getEffectiveStatus(transaction)
  const isExpense = transaction.type === 'expense'

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-surface-sunken"
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: transaction.category?.color ?? '#A78BFA' }}
      >
        {transaction.category?.icon ||
          (transaction.category?.name ?? transaction.description).slice(0, 1).toUpperCase()}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-content">{transaction.description}</span>
        <span className="block truncate text-xs text-content-muted">
          {transaction.category?.name ?? 'Sem categoria'} · {formatDate(transaction.due_date)}
          {transaction.installment_total && transaction.installment_total > 1
            ? ` · ${transaction.installment_number}/${transaction.installment_total}`
            : ''}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-1">
        <span className={clsx('text-sm font-semibold', isExpense ? 'text-status-late' : 'text-status-paid')}>
          {isExpense ? '-' : '+'} {formatCurrency(transaction.amount)}
        </span>
        <StatusBadge status={status} type={transaction.type} />
      </span>
    </button>
  )
}
