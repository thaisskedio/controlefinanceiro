import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { listBudgetPlans, upsertBudgetPlan } from '../services/budgetPlans'
import type { BudgetGroup } from '../types/database'

export function useBudgetPlans(period: string) {
  return useQuery({ queryKey: ['budget_plans', period], queryFn: () => listBudgetPlans(period) })
}

export function useUpsertBudgetPlan(period: string) {
  const qc = useQueryClient()
  const { userId } = useAuth()
  return useMutation({
    mutationFn: ({ categoryGroup, plannedAmount }: { categoryGroup: BudgetGroup; plannedAmount: number }) =>
      upsertBudgetPlan(userId!, period, categoryGroup, plannedAmount),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget_plans', period] }),
  })
}
