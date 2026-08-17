import { supabase } from '../lib/supabase'

interface CreateUserResponse {
  ok: boolean
  error?: string
  user?: { id: string; email: string }
}

// O nome de exibição da function no painel do Supabase é "create-user", mas o
// slug real do endpoint (o que precisa ser usado aqui) ficou como
// "smooth-processor" — gerado automaticamente na criação e que renomear o
// campo "Name" nas Settings da function não altera.
const FUNCTION_SLUG = 'smooth-processor'

export async function createInternalUser(email: string, password: string, name: string) {
  const { data, error } = await supabase.functions.invoke<CreateUserResponse>(FUNCTION_SLUG, {
    body: { email, password, name },
  })
  if (error) throw new Error(error.message)
  if (!data?.ok) throw new Error(data?.error ?? 'Erro desconhecido ao criar usuário.')
  return data.user
}
