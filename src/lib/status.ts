import type { Transaction, TransactionStatus, TransactionType } from '../types/database'

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

/** Despesa usa "pago"/"a pagar"; receita usa "recebido"/"a receber". */
export const STATUS_LABELS: Record<TransactionType, Record<TransactionStatus, string>> = {
  expense: {
    paid: 'Pago',
    pending: 'Pendente',
    late: 'Atrasado',
    canceled: 'Cancelado',
  },
  income: {
    paid: 'Recebido',
    pending: 'A receber',
    late: 'Atrasado',
    canceled: 'Cancelado',
  },
}

export function getStatusLabel(status: TransactionStatus, type: TransactionType): string {
  return STATUS_LABELS[type][status]
}
