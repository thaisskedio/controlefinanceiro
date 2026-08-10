import { Moon, Sun } from 'lucide-react'
import { Card } from '../components/ui/Card'
import { useTheme } from '../context/ThemeContext'

const PALETTE = [
  { name: 'Rosa', hex: '#F472B6' },
  { name: 'Rosa escuro', hex: '#EC4899' },
  { name: 'Lilás', hex: '#A78BFA' },
  { name: 'Lilás claro', hex: '#C4B5FD' },
  { name: 'Azul petróleo', hex: '#0F4C5C' },
  { name: 'Azul petróleo escuro', hex: '#134E5E' },
]

export function Settings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="mb-3 text-sm font-medium text-content">Tema</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              theme === 'light' ? 'border-brand-lilac bg-brand-lilac/10' : 'border-border'
            }`}
          >
            <Sun size={20} className="text-content" />
            <span className="text-sm text-content">Claro</span>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
              theme === 'dark' ? 'border-brand-lilac bg-brand-lilac/10' : 'border-border'
            }`}
          >
            <Moon size={20} className="text-content" />
            <span className="text-sm text-content">Escuro</span>
          </button>
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-sm font-medium text-content">Paleta de cores</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PALETTE.map((c) => (
            <div key={c.hex} className="flex items-center gap-2 rounded-xl border border-border p-3">
              <span className="h-8 w-8 shrink-0 rounded-full" style={{ backgroundColor: c.hex }} />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-content">{c.name}</p>
                <p className="truncate text-[11px] text-content-muted">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-medium text-content">Sobre</p>
        <p className="mt-1 text-xs text-content-muted">
          Controle Financeiro — registro de despesas, receitas, parcelamentos e planejamento orçamentário.
        </p>
      </Card>
    </div>
  )
}
