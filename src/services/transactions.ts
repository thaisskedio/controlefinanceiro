import { addMonths, addWeeks, addYears, formatISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { RecurrenceFrequency, Transaction, TransactionWithCategory } from '../types/database'
import { todayISO } from '../lib/status'

export interface TransactionFilters {
  status?: Transaction['status']
  categoryId?: string
  type?: Transaction['type']
  from?: string
  to?: string
}

export async function listTransactions(filters: TransactionFilters = {}): Promise<TransactionWithCategory[]> {
  let query = supabase
    .from('transactions')
    .select('*, category:categories(*)')
    .neq('status', 'canceled')
    .order('due_date', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  if (filters.type) query = query.eq('type', filters.type)
  if (filters.from) query = query.gte('due_date', filters.from)
  if (filters.to) query = query.lte('due_date', filters.to)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as TransactionWithCategory[]
}

function nextDueDate(date: Date, frequency: RecurrenceFrequency): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(date, 1)
    case 'yearly':
      return addYears(date, 1)
    case 'monthly':
    case 'none':
    default:
      return addMonths(date, 1)
  }
}

export type NewTransactionInput = Omit<
  Transaction,
  | 'id'
  | 'user_id'
  | 'created_at'
  | 'updated_at'
  | 'status'
  | 'paid_date'
  | 'canceled_at'
  | 'installment_group_id'
  | 'installment_number'
>

/**
 * Cria um lançamento. Quando `is_installment` + `installment_total > 1`, gera
 * automaticamente N linhas com `installment_group_id` comum, valor dividido
 * igualmente (ajuste de arredondamento na última parcela) e due_date
 * incrementando conforme `recurrence_frequency` (padrão mensal).
 */
export async function createTransaction(userId: string, input: NewTransactionInput) {
  const baseDueDate = new Date(`${input.due_date}T00:00:00`)

  if (input.is_installment && input.installment_total && input.installment_total > 1) {
    const total = input.total_amount ?? input.amount
    const count = input.installment_total
    const cents = Math.round(total * 100)
    const baseShare = Math.floor(cents / count)
    const remainder = cents - baseShare * count

    const groupId = crypto.randomUUID()
    const rows = Array.from({ length: count }, (_, i) => {
      const shareCents = baseShare + (i === count - 1 ? remainder : 0)
      const dueDate = i === 0 ? baseDueDate : nthDate(baseDueDate, input.recurrence_frequency, i)
      return {
        ...input,
        user_id: userId,
        amount: shareCents / 100,
        total_amount: total,
        installment_group_id: groupId,
        installment_number: i + 1,
        due_date: formatISO(dueDate, { representation: 'date' }),
        status: 'pending' as const,
      }
    })

    const { data, error } = await supabase.from('transactions').insert(rows).select('*')
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...input, user_id: userId, status: 'pending' })
    .select('*')
    .single()
  if (error) throw error
  return [data]
}

function nthDate(base: Date, frequency: RecurrenceFrequency, n: number): Date {
  let date = base
  for (let i = 0; i < n; i++) date = nextDueDate(date, frequency)
  return date
}

export async function updateTransaction(id: string, input: Partial<Transaction>) {
  const { data, error } = await supabase.from('transactions').update(input).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function markAsPaid(id: string) {
  return updateTransaction(id, { status: 'paid', paid_date: todayISO() })
}

export async function markAsPending(id: string) {
  return updateTransaction(id, { status: 'pending', paid_date: null })
}

export type CancelScope = 'single' | 'future'

export async function cancelTransaction(transaction: Transaction, scope: CancelScope) {
  const canceled_at = new Date().toISOString()

  if (scope === 'single' || !transaction.installment_group_id) {
    return updateTransaction(transaction.id, { status: 'canceled', canceled_at })
  }

  const { error } = await supabase
    .from('transactions')
    .update({ status: 'canceled', canceled_at })
    .eq('installment_group_id', transaction.installment_group_id)
    .gte('installment_number', transaction.installment_number ?? 0)
  if (error) throw error
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
