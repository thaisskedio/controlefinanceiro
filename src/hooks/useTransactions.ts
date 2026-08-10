import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import {
  cancelTransaction,
  createTransaction,
  deleteTransaction,
  listTransactions,
  markAsPaid,
  markAsPending,
  updateTransaction,
  type CancelScope,
  type NewTransactionInput,
  type TransactionFilters,
} from '../services/transactions'
import type { Transaction } from '../types/database'

const KEY = ['transactions']

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: [...KEY, filters],
    queryFn: () => listTransactions(filters),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  const { userId } = useAuth()
  return useMutation({
    mutationFn: (input: NewTransactionInput) => createTransaction(userId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Transaction> }) => updateTransaction(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useMarkAsPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markAsPaid(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useMarkAsPending() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markAsPending(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useCancelTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ transaction, scope }: { transaction: Transaction; scope: CancelScope }) =>
      cancelTransaction(transaction, scope),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
