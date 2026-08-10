import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useLocation } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'

export function Header() {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const current = NAV_ITEMS.find((item) => (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)))

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface-raised/80 px-4 py-4 backdrop-blur sm:px-6">
      <h1 className="text-lg font-semibold text-content sm:text-xl">{current?.label ?? 'Finanças'}</h1>
      <button
        onClick={toggleTheme}
        aria-label="Alternar tema"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-content-muted transition-colors hover:bg-surface-sunken"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  )
}
