import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { createCategory, deleteCategory, listCategories, updateCategory } from '../services/categories'
import type { Category } from '../types/database'

const KEY = ['categories']

export function useCategories() {
  return useQuery({ queryKey: KEY, queryFn: listCategories })
}

export function useCreateCategory() {
  const qc = useQueryClient()
  const { userId } = useAuth()
  return useMutation({
    mutationFn: (input: Omit<Category, 'id' | 'user_id' | 'created_at'>) => createCategory(userId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useUpdateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<Omit<Category, 'id' | 'user_id'>> }) =>
      updateCategory(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}

export function useDeleteCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  })
}
