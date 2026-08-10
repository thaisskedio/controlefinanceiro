import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-card border border-border bg-surface-raised p-4 shadow-sm sm:p-5',
        className,
      )}
      {...props}
    />
  )
}
