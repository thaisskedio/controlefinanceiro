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

function nextDueDate(date: Date, frequency: RecurrenceFrequency, interval: number): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(date, interval)
    case 'yearly':
      return addYears(date, interval)
    case 'monthly':
    case 'none':
    default:
      return addMonths(date, interval)
  }
}

function nthDate(base: Date, frequency: RecurrenceFrequency, interval: number, n: number): Date {
  let date = base
  for (let i = 0; i < n; i++) date = nextDueDate(date, frequency, interval)
  return date
}

/** Limite de segurança para quantas ocorrências uma série recorrente pode gerar de uma vez. */
export const MAX_RECURRING_OCCURRENCES = 120

function generateOccurrenceDates(start: Date, end: Date, frequency: RecurrenceFrequency, interval: number): Date[] {
  const dates: Date[] = [start]
  let current = start
  while (dates.length < MAX_RECURRING_OCCURRENCES + 1) {
    const next = nextDueDate(current, frequency, interval)
    if (next > end) break
    dates.push(next)
    current = next
  }
  return dates
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
  | 'recurrence_group_id'
> & {
  /** Só usado na criação para calcular quantas ocorrências gerar; não é persistido. */
  recurrence_end_date?: string | null
}

/**
 * Cria um lançamento.
 * - Parcelamento (`is_installment` + `installment_total > 1`): gera N linhas com
 *   `installment_group_id` comum, valor dividido igualmente (ajuste de
 *   arredondamento na última parcela) e due_date incrementando conforme
 *   `recurrence_frequency` + `recurrence_interval`.
 * - Recorrência (`is_recurring` + `recurrence_end_date`): gera uma linha para
 *   cada ocorrência entre `due_date` e `recurrence_end_date`, todas com o
 *   mesmo valor e um `recurrence_group_id` comum (até MAX_RECURRING_OCCURRENCES).
 */
export async function createTransaction(userId: string, input: NewTransactionInput) {
  const { recurrence_end_date, ...rest } = input
  const baseDueDate = new Date(`${rest.due_date}T00:00:00`)

  if (rest.is_installment && rest.installment_total && rest.installment_total > 1) {
    const total = rest.total_amount ?? rest.amount
    const count = rest.installment_total
    const cents = Math.round(total * 100)
    const baseShare = Math.floor(cents / count)
    const remainder = cents - baseShare * count

    const groupId = crypto.randomUUID()
    const rows = Array.from({ length: count }, (_, i) => {
      const shareCents = baseShare + (i === count - 1 ? remainder : 0)
      const dueDate =
        i === 0 ? baseDueDate : nthDate(baseDueDate, rest.recurrence_frequency, rest.recurrence_interval, i)
      return {
        ...rest,
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

  if (rest.is_recurring && recurrence_end_date) {
    const endDate = new Date(`${recurrence_end_date}T00:00:00`)
    const dates = generateOccurrenceDates(baseDueDate, endDate, rest.recurrence_frequency, rest.recurrence_interval)
    const groupId = crypto.randomUUID()
    const rows = dates.map((d) => ({
      ...rest,
      user_id: userId,
      recurrence_group_id: groupId,
      due_date: formatISO(d, { representation: 'date' }),
      status: 'pending' as const,
    }))

    const { data, error } = await supabase.from('transactions').insert(rows).select('*')
    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...rest, user_id: userId, status: 'pending' })
    .select('*')
    .single()
  if (error) throw error
  return [data]
}

export async function updateTransaction(id: string, input: Partial<Transaction>) {
  const { data, error } = await supabase.from('transactions').update(input).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

/**
 * Aplica a mudança a esta ocorrência e a todas as futuras da mesma série
 * recorrente (due_date >= a desta). Não mexe em `due_date` de cada ocorrência.
 */
export async function updateTransactionSeries(transaction: Transaction, input: Partial<Transaction>) {
  if (!transaction.recurrence_group_id) {
    return updateTransaction(transaction.id, input)
  }
  const seriesInput = { ...input }
  delete seriesInput.due_date
  const { error } = await supabase
    .from('transactions')
    .update(seriesInput)
    .eq('recurrence_group_id', transaction.recurrence_group_id)
    .gte('due_date', transaction.due_date)
  if (error) throw error
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
  const groupId = transaction.installment_group_id ?? transaction.recurrence_group_id
  const groupColumn = transaction.installment_group_id ? 'installment_group_id' : 'recurrence_group_id'

  if (scope === 'single' || !groupId) {
    return updateTransaction(transaction.id, { status: 'canceled', canceled_at })
  }

  const { error } = await supabase
    .from('transactions')
    .update({ status: 'canceled', canceled_at })
    .eq(groupColumn, groupId)
    .gte('due_date', transaction.due_date)
  if (error) throw error
}

export async function deleteTransaction(id: string) {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) throw error
}
