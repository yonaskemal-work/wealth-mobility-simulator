export function formatWealth(n: number): string {
  if (!Number.isFinite(n) || Number.isNaN(n)) return '$0'
  if (n < 0) return `-${formatWealth(-n)}`
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function formatWealthLong(n: number): string {
  if (!Number.isFinite(n) || Number.isNaN(n)) return '$0'
  if (n < 0) return `-${formatWealthLong(-n)}`
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function formatPercent(n: number): string {
  if (!Number.isFinite(n) || Number.isNaN(n)) return '0.0%'
  return `${(n * 100).toFixed(1)}%`
}

export function formatYears(n: number | null): string {
  if (n === null || n > 40) return '40+'
  if (n <= 0) return '<1 yr'
  return `${n} yrs`
}
