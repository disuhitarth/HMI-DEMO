'use client'

interface Props {
  label: string
  value: string | number
  unit?: string
  accentColor: string
}

export default function KpiCard({ label, value, unit, accentColor }: Props) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderTop: `2px solid ${accentColor}`,
        borderRadius: '4px',
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
      }}
    >
      <div
        style={{
          fontSize: '9px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.12em',
          fontFamily: 'Rajdhani, sans-serif',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
        }}
      >
        <span
          className="mono"
          style={{
            fontSize: '22px',
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
