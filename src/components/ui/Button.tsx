import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-brand-pink to-brand-lilac text-white hover:opacity-90 shadow-sm',
  secondary: 'bg-surface-sunken text-content hover:bg-border/60',
  ghost: 'bg-transparent text-content hover:bg-surface-sunken',
  danger: 'bg-status-late/10 text-status-late hover:bg-status-late/20',
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}
