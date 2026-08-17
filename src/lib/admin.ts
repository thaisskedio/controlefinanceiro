// Só controla se a tela de admin aparece na UI — quem garante a permissão de
// verdade é a checagem equivalente dentro da Edge Function create-user
// (secret ADMIN_EMAILS). Mantenha as duas listas iguais.
const ADMIN_EMAILS = ['thais.soreano@outlook.pt', 'thais.alca2c@gmail.com']

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
