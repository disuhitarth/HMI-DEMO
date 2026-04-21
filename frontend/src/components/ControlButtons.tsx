'use client'

import { useDetectionStore } from '@/store/detectionStore'
import { BACKEND_URL } from '@/lib/constants'

export default function ControlButtons() {
  const isRunning = useDetectionStore((s) => s.isRunning)
  const setRunning = useDetectionStore((s) => s.setRunning)
  const setSessionStart = useDetectionStore((s) => s.setSessionStart)

  async function handleStart() {
    try {
      const res = await fetch(`${BACKEND_URL}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      })
      if (res.ok) {
        setRunning(true)
        setSessionStart(new Date())
      }
    } catch {
      // network error — UI still shows state
    }
  }

  async function handleStop() {
    try {
      const res = await fetch(`${BACKEND_URL}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' }),
      })
      if (res.ok) {
        setRunning(false)
      }
    } catch {
      // network error
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div
        className="mono"
        style={{
          fontSize: '9px',
          color: 'var(--text-secondary)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        // SYSTEM CONTROL
      </div>
      {!isRunning ? (
        <button
          onClick={handleStart}
          style={{
            width: '100%',
            height: '44px',
            background: 'rgba(0,255,136,0.13)',
            border: '1px solid var(--green)',
            color: 'var(--green)',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(0,255,136,0.27)'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(0,255,136,0.13)'
          }}
        >
          ▶ START INSPECTION
        </button>
      ) : (
        <button
          onClick={handleStop}
          style={{
            width: '100%',
            height: '44px',
            background: 'rgba(255,34,68,0.13)',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
            fontSize: '15px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(255,34,68,0.27)'
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(255,34,68,0.13)'
          }}
        >
          ■ STOP INSPECTION
        </button>
      )}
    </div>
  )
}
