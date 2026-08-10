import clsx from 'clsx'

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value))
  const overBudget = value > 100

  return (
    <div className={clsx('h-2 w-full overflow-hidden rounded-full bg-surface-sunken', className)}>
      <div
        className={clsx(
          'h-full rounded-full transition-all',
          overBudget
            ? 'bg-status-late'
            : 'bg-gradient-to-r from-brand-pink to-brand-lilac',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
