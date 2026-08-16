import { ChevronLeft, ChevronRight } from 'lucide-react'
import { monthInputLabel, shiftMonthInput } from '../../lib/period'

export function MonthNav({ month, onChange }: { month: string; onChange: (month: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(shiftMonthInput(month, -1))}
        aria-label="Mês anterior"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-content-muted transition-colors hover:bg-surface-sunken"
      >
        <ChevronLeft size={16} />
      </button>
      <p className="min-w-[9rem] text-center text-sm font-medium capitalize text-content">
        {monthInputLabel(month)}
      </p>
      <button
        onClick={() => onChange(shiftMonthInput(month, 1))}
        aria-label="Próximo mês"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-content-muted transition-colors hover:bg-surface-sunken"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
