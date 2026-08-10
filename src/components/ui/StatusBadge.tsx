import clsx from 'clsx'
import type { TransactionStatus } from '../../types/database'
import { STATUS_LABELS } from '../../lib/status'

const dotClasses: Record<TransactionStatus, string> = {
  paid: 'bg-status-paid',
  pending: 'bg-status-pending',
  late: 'bg-status-late',
  canceled: 'bg-status-canceled',
}

const textClasses: Record<TransactionStatus, string> = {
  paid: 'text-status-paid bg-status-paid/10',
  pending: 'text-status-pending bg-status-pending/10',
  late: 'text-status-late bg-status-late/10',
  canceled: 'text-status-canceled bg-status-canceled/10',
}

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        textClasses[status],
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', dotClasses[status])} />
      {STATUS_LABELS[status]}
    </span>
  )
}
