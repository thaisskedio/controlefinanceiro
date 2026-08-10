export type TransactionType = 'expense' | 'income'
export type CategoryGroup = 'fixed' | 'variable'
export type RecurrenceFrequency = 'monthly' | 'weekly' | 'yearly' | 'none'
export type TransactionStatus = 'paid' | 'pending' | 'late' | 'canceled'
export type BudgetGroup = 'expenses' | 'savings' | 'leisure' | 'emergency'

export interface Category {
  id: string
  user_id: string
  name: string
  type: TransactionType
  group: CategoryGroup
  color: string
  icon: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  category_id: string | null
  type: TransactionType
  description: string
  amount: number
  total_amount: number | null
  is_recurring: boolean
  recurrence_frequency: RecurrenceFrequency
  is_installment: boolean
  installment_group_id: string | null
  installment_number: number | null
  installment_total: number | null
  due_date: string
  paid_date: string | null
  status: TransactionStatus
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface TransactionWithCategory extends Transaction {
  category: Category | null
}

export interface BudgetPlan {
  id: string
  user_id: string
  period: string
  category_group: BudgetGroup
  planned_amount: number
  created_at: string
}

