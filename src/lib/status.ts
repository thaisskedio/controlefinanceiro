import type { Transaction, TransactionStatus } from '../types/database'

/** Deriva o status efetivo: `pending` vira `late` quando due_date já passou. */
export function getEffectiveStatus(transaction: Pick<Transaction, 'status' | 'due_date'>): TransactionStatus {
  if (transaction.status === 'pending' && transaction.due_date < todayISO()) {
    return 'late'
  }
  return transaction.status
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  late: 'Atrasado',
  canceled: 'Cancelado',
}
