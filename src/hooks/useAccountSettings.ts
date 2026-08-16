import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { getAccountSettings, setInitialBalance } from '../services/accountSettings'

const KEY = ['account_settings']

export function useAccountSettings() {
  return useQuery({ queryKey: KEY, queryFn: getAccountSettings })
}

export function useSetInitialBalance() {
  const qc = useQueryClient()
  const { userId } = useAuth()
  return useMutation({
    mutationFn: (initialBalance: number) => setInitialBalance(userId!, initialBalance),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
