import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** "YYYY-MM" para uso em <input type="month"> */
export function currentMonthInput(): string {
  return format(new Date(), 'yyyy-MM')
}

export function monthInputToRange(monthInput: string): { from: string; to: string } {
  const date = new Date(`${monthInput}-01T00:00:00`)
  return {
    from: format(startOfMonth(date), 'yyyy-MM-dd'),
    to: format(endOfMonth(date), 'yyyy-MM-dd'),
  }
}

export function monthInputLabel(monthInput: string): string {
  const date = new Date(`${monthInput}-01T00:00:00`)
  return format(date, 'MMMM yyyy', { locale: ptBR })
}

export function shiftMonthInput(monthInput: string, delta: number): string {
  const date = new Date(`${monthInput}-01T00:00:00`)
  const shifted = delta >= 0 ? addMonths(date, delta) : subMonths(date, -delta)
  return format(shifted, 'yyyy-MM')
}
