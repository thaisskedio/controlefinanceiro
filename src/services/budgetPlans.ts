import { supabase } from '../lib/supabase'
import type { BudgetGroup, BudgetPlan } from '../types/database'

export async function listBudgetPlans(period: string): Promise<BudgetPlan[]> {
  const { data, error } = await supabase.from('budget_plans').select('*').eq('period', period)
  if (error) throw error
  return data
}

export async function upsertBudgetPlan(
  userId: string,
  period: string,
  categoryGroup: BudgetGroup,
  plannedAmount: number,
) {
  const { data, error } = await supabase
    .from('budget_plans')
    .upsert(
      { user_id: userId, period, category_group: categoryGroup, planned_amount: plannedAmount },
      { onConflict: 'user_id,period,category_group' },
    )
    .select('*')
    .single()
  if (error) throw error
  return data
}
