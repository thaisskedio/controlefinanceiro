// Supabase Edge Function: cria um usuário já confirmado (sem e-mail de
// verificação), definindo a senha diretamente. Só quem estiver na lista
// ADMIN_EMAILS (secret da function) pode chamar isso — a checagem de
// permissão no frontend é só cosmética, quem garante segurança é aqui.
//
// Deploy: cole este arquivo em Supabase Dashboard > Edge Functions >
// create-user (ou `supabase functions deploy create-user` via CLI).
//
// Secrets necessários (Edge Functions > Secrets):
//   ADMIN_EMAILS = thais.alca2c@gmail.com
// SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY já vêm
// automaticamente disponíveis em toda Edge Function do projeto — não
// precisa cadastrar esses três manualmente (confira em Secrets; se por
// algum motivo SUPABASE_SERVICE_ROLE_KEY não aparecer lá, copie o valor
// de Project Settings > API > service_role e adicione).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const adminEmails = (Deno.env.get('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ ok: false, error: 'Não autenticado.' })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Cliente com o token de quem chamou, só para descobrir quem é.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: callerData, error: callerError } = await callerClient.auth.getUser()
    const callerEmail = callerData?.user?.email?.toLowerCase()

    if (callerError || !callerEmail) return json({ ok: false, error: 'Não autenticado.' })
    if (!adminEmails.includes(callerEmail)) return json({ ok: false, error: 'Sem permissão.' })

    const { email, password, name } = await req.json()
    if (!email || !password || !name) {
      return json({ ok: false, error: 'Preencha nome, e-mail e senha.' })
    }
    if (String(password).length < 6) {
      return json({ ok: false, error: 'A senha precisa ter pelo menos 6 caracteres.' })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (error) return json({ ok: false, error: error.message })

    return json({ ok: true, user: { id: data.user.id, email: data.user.email } })
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : 'Erro inesperado.' })
  }
})
