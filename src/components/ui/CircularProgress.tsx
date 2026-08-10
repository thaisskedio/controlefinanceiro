export function CircularProgress({
  value,
  size = 96,
  strokeWidth = 10,
  label,
}: {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
}) {
  const pct = Math.min(100, Math.max(0, value))
  const overBudget = value > 100
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-surface-sunken"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={overBudget ? 'stroke-status-late' : 'stroke-brand-lilac'}
          fill="none"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-semibold text-content">{Math.round(value)}%</span>
        {label && <span className="text-[10px] text-content-muted">{label}</span>}
      </div>
    </div>
  )
}
