import { supabase } from '../lib/supabase'

interface CreateUserResponse {
  ok: boolean
  error?: string
  user?: { id: string; email: string }
}

export async function createInternalUser(email: string, password: string, name: string) {
  const { data, error } = await supabase.functions.invoke<CreateUserResponse>('create-user', {
    body: { email, password, name },
  })
  if (error) throw new Error(error.message)
  if (!data?.ok) throw new Error(data?.error ?? 'Erro desconhecido ao criar usuário.')
  return data.user
}
