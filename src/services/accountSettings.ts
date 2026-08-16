import { supabase } from '../lib/supabase'
import type { AccountSettings } from '../types/database'

/** Retorna null quando o usuário ainda não definiu um saldo inicial (padrão: 0). */
export async function getAccountSettings(): Promise<AccountSettings | null> {
  const { data, error } = await supabase.from('account_settings').select('*').maybeSingle()
  if (error) throw error
  return data
}

export async function setInitialBalance(userId: string, initialBalance: number) {
  const { data, error } = await supabase
    .from('account_settings')
    .upsert({ user_id: userId, initial_balance: initialBalance }, { onConflict: 'user_id' })
    .select('*')
    .single()
  if (error) throw error
  return data as AccountSettings
}
