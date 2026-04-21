'use client'

import { useDetectionStore } from '@/store/detectionStore'
import { WS_URL } from '@/lib/constants'

function Dot({ active }: { active: boolean }) {
  return (
    <span style={{ color: active ? 'var(--green)' : 'var(--red)' }}>●</span>
  )
}

export default function StatusBar() {
  const connected = useDetectionStore((s) => s.connected)
  const data = useDetectionStore((s) => s.data)
  const cameraOk = data?.camera_info?.status === 'CONNECTED'

  const wsDisplay = WS_URL.length > 30 ? WS_URL.slice(0, 30) + '…' : WS_URL

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '32px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '20px',
        zIndex: 100,
      }}
    >
      {/* Left cluster */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {[
          { label: connected ? 'BACKEND CONNECTED' : 'DISCONNECTED', active: connected },
          { label: cameraOk ? 'CAMERA ACTIVE' : 'CAMERA OFFLINE', active: cameraOk },
          { label: 'YOLOV8N LOADED', active: true },
          { label: 'APPLE MPS', active: true },
        ].map(({ label, active }) => (
          <span
            key={label}
            className="mono"
            style={{
              fontSize: '10px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Dot active={active} /> {label}
          </span>
        ))}
      </div>

      {/* Center */}
      <div style={{ flex: 1, textAlign: 'center' }}>
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            fontFamily: 'Rajdhani, sans-serif',
            letterSpacing: '0.2em',
          }}
        >
          MEGHNA QC VISION &nbsp;v1.0.0 &nbsp;—— &nbsp;DEMO MODE
        </span>
      </div>

      {/* Right */}
      <div>
        <span
          className="mono"
          style={{ fontSize: '10px', color: 'var(--text-secondary)' }}
        >
          WS: {wsDisplay}
        </span>
      </div>
    </div>
  )
}
