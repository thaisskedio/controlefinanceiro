import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { Wallet } from 'lucide-react'
import { NAV_ITEMS } from './navItems'

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface-raised px-4 py-6 md:flex lg:w-64">
      <div className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-pink to-brand-lilac text-white">
          <Wallet size={18} />
        </span>
        <span className="text-lg font-semibold text-content">Finanças</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-brand-pink/15 to-brand-lilac/15 text-brand-lilacDark dark:text-brand-lilac'
                  : 'text-content-muted hover:bg-surface-sunken hover:text-content',
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
