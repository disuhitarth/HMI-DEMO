'use client'

import { useDetectionStore } from '@/store/detectionStore'
import { formatConfidence } from '@/lib/formatters'

export default function DetectionPanel() {
  const data = useDetectionStore((s) => s.data)
  const detections = data?.detections ?? []
  const isRunning = data?.is_running ?? false

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.12em',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          DETECTIONS
        </span>
        <span
          style={{
            fontSize: '10px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '1px 8px',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
          }}
        >
          {detections.length}
        </span>
      </div>

      {!isRunning && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          ◌ System paused
        </div>
      )}

      {isRunning && detections.length === 0 && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontFamily: 'monospace',
          }}
        >
          ◌ No objects detected
        </div>
      )}

      {isRunning && detections.length > 0 && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          {detections.map((det, i) => (
            <div
              key={i}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '5px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {det.class}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: '11px',
                  color: 'var(--green)',
                }}
              >
                {formatConfidence(det.confidence)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
