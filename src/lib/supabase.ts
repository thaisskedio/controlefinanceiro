import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill in your Supabase project credentials.',
  )
}

// Sem o generic `Database<...>`: tipamos manualmente as entidades em
// src/types/database.ts e os retornos de cada função em src/services/*,
// evitando fricção com a inferência de tipos do postgrest-js.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
