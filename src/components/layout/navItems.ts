import { Home, ListChecks, Tags, Target, Settings } from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/lancamentos', label: 'Lançamentos', icon: ListChecks },
  { to: '/categorias', label: 'Categorias', icon: Tags },
  { to: '/planejamento', label: 'Planejamento', icon: Target },
  { to: '/configuracoes', label: 'Ajustes', icon: Settings },
] as const
