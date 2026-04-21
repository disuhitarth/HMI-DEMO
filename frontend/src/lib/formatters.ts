export function formatTimestamp(iso: string | null): string {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  } catch {
    return '—'
  }
}

export function formatDwell(seconds: number | null): string {
  if (seconds == null) return '—'
  return `${seconds.toFixed(1)}s`
}

export function formatConfidence(conf: number | null): string {
  if (conf == null) return '—'
  return `${Math.round(conf * 100)}%`
}

export function formatPassRate(rate: number): string {
  return `${rate.toFixed(1)}%`
}

export function formatSessionTime(startDate: Date | null): string {
  if (!startDate) return '00:00:00'
  const elapsed = Math.floor((Date.now() - startDate.getTime()) / 1000)
  const h = Math.floor(elapsed / 3600)
  const m = Math.floor((elapsed % 3600) / 60)
  const s = elapsed % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}
