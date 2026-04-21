'use client'

import { useEffect, useState } from 'react'
import { useDetectionStore } from '@/store/detectionStore'
import KpiCard from './KpiCard'
import { formatPassRate, formatDwell, formatSessionTime } from '@/lib/formatters'

export default function KpiPanel() {
  const data = useDetectionStore((s) => s.data)
  const sessionStart = useDetectionStore((s) => s.sessionStart)
  const [sessionTime, setSessionTime] = useState('00:00:00')

  useEffect(() => {
    const id = setInterval(() => {
      setSessionTime(formatSessionTime(sessionStart))
    }, 1000)
    return () => clearInterval(id)
  }, [sessionStart])

  const stats = data?.session_stats
  const total = stats?.total ?? 0
  const passCount = stats?.pass_count ?? 0
  const failCount = stats?.fail_count ?? 0
  const passRate = stats?.pass_rate ?? 0
  const avgDwell = stats?.avg_dwell ?? null

  const passRateColor =
    passRate >= 90
      ? 'var(--green)'
      : passRate >= 70
      ? 'var(--amber)'
      : 'var(--red)'

  // Mock estimated savings: e.g. $12.50 saved per passed item
  const savings = passCount * 12.50
  const formattedSavings = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(savings)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridAutoRows: 'min-content',
        gap: '8px',
        flex: 1,
        overflowY: 'auto'
      }}
    >
      <KpiCard label="INSPECTED" value={total} accentColor="var(--blue)" />
      <KpiCard label="PASSED" value={passCount} accentColor="var(--green)" />
      <KpiCard label="FAILED" value={failCount} accentColor="var(--red)" />
      <KpiCard
        label="PASS RATE"
        value={formatPassRate(passRate)}
        accentColor={passRateColor}
      />
      <KpiCard
        label="AVG DWELL"
        value={formatDwell(avgDwell)}
        accentColor="var(--amber)"
      />
      <KpiCard
        label="SESSION"
        value={sessionTime}
        accentColor="var(--text-primary)"
      />
      <div style={{ gridColumn: '1 / -1' }}>
        <KpiCard
          label="EST. SAVINGS"
          value={formattedSavings}
          accentColor="var(--green)"
        />
      </div>
    </div>
  )
}

