import { supabase } from '../lib/supabase'
import type { Category } from '../types/database'

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return data
}

export async function createCategory(userId: string, input: Omit<Category, 'id' | 'user_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...input, user_id: userId })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(id: string, input: Partial<Omit<Category, 'id' | 'user_id'>>) {
  const { data, error } = await supabase.from('categories').update(input).eq('id', id).select('*').single()
  if (error) throw error
  return data
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
