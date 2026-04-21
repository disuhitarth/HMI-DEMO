'use client'

import { useDetectionStore } from '@/store/detectionStore'
import { formatTimestamp, formatDwell, formatConfidence } from '@/lib/formatters'

export default function PassFailDisplay() {
  const data = useDetectionStore((s) => s.data)

  const status = data?.pass_fail ?? 'IDLE'
  const confidence = data?.confidence ?? null
  const currentObject = data?.current_object ?? null
  const entryTime = data?.entry_time ?? null
  const exitTime = data?.exit_time ?? null
  const dwellSeconds = data?.dwell_seconds ?? null
  const llmDesc = data?.llm_description ?? null

  const confPct = confidence != null ? Math.round(confidence * 100) : 0
  const confColor = confPct > 80 ? 'var(--green)' : confPct > 50 ? 'var(--amber)' : 'var(--red)'

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Giant status */}
      <div style={{ textAlign: 'center', padding: '4px 0' }}>
        {status === 'PASS' && (
          <div
            className="orbitron animate-pass-glow"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: 'var(--green)',
              lineHeight: 1,
            }}
          >
            ◆ PASS
          </div>
        )}
        {status === 'FAIL' && (
          <div
            className="orbitron animate-fail-flash"
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              color: 'var(--red)',
              lineHeight: 1,
            }}
          >
            ✕ FAIL
          </div>
        )}
        {status === 'IN_ZONE' && (
          <div
            className="orbitron"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              color: 'var(--amber)',
              lineHeight: 1,
            }}
          >
            ◈ IN ZONE
          </div>
        )}
        {status === 'IDLE' && (
          <div
            className="orbitron"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              color: 'var(--text-secondary)',
              lineHeight: 1,
            }}
          >
            ◌ STANDBY
          </div>
        )}
      </div>

      {/* Object name */}
      <div style={{ textAlign: 'center' }}>
        <span
          style={{
            fontSize: '20px',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {currentObject ?? '— NONE —'}
        </span>
      </div>

      {/* Confidence bar */}
      {confidence != null && (
        <div>
          <div
            style={{
              fontSize: '9px',
              color: 'var(--text-secondary)',
              letterSpacing: '0.12em',
              fontFamily: 'monospace',
              marginBottom: '4px',
              textTransform: 'uppercase',
            }}
          >
            Confidence
          </div>
          <div
            style={{
              background: 'var(--border)',
              borderRadius: '3px',
              height: '6px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${confPct}%`,
                background: `linear-gradient(90deg, ${confColor}aa, ${confColor})`,
                borderRadius: '3px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div
            className="mono"
            style={{
              fontSize: '11px',
              color: confColor,
              textAlign: 'right',
              marginTop: '2px',
            }}
          >
            {formatConfidence(confidence)}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {[
          ['ENTRY', formatTimestamp(entryTime)],
          ['EXIT', formatTimestamp(exitTime)],
          ['DWELL', formatDwell(dwellSeconds)],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: 'var(--text-secondary)',
                letterSpacing: '0.1em',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
            <span className="mono" style={{ fontSize: '13px', color: 'var(--green)' }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* AI Analysis box */}
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: '4px',
          padding: '8px 10px',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            color: 'var(--amber)',
            letterSpacing: '0.12em',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            marginBottom: '5px',
          }}
        >
          ✦ AI ANALYSIS
        </div>
        <div
          style={{
            maxHeight: '80px',
            overflowY: 'auto',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontFamily: 'Rajdhani, sans-serif',
            lineHeight: 1.4,
          }}
        >
          {llmDesc === null && (
            <span>Awaiting detection...</span>
          )}
          {llmDesc === 'Analyzing...' && (
            <span className="animate-pulse-opacity">{llmDesc}</span>
          )}
          {llmDesc && llmDesc !== 'Analyzing...' && (
            <span>{llmDesc}</span>
          )}
        </div>
      </div>
    </div>
  )
}
