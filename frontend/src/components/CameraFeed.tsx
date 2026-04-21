'use client'

import { useRef } from 'react'
import { useDetectionStore } from '@/store/detectionStore'
import { VIDEO_URL } from '@/lib/constants'
import CanvasOverlay from './CanvasOverlay'

const DEFAULT_ZONE = { x1: 0.28, y1: 0.18, x2: 0.72, y2: 0.82 }

export default function CameraFeed() {
  const imgRef = useRef<HTMLImageElement>(null)
  const data = useDetectionStore((s) => s.data)

  const detections = data?.detections ?? []
  const zoneConfig = data?.zone_config ?? DEFAULT_ZONE
  const zoneStatus = data?.zone_status ?? 'IDLE'
  const fps = data?.fps ?? 0
  const inferenceMs = data?.inference_ms ?? 0
  const cameraInfo = data?.camera_info

  const camConnected = cameraInfo?.status === 'CONNECTED'

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Video + Canvas overlay */}
      <div style={{ position: 'relative', flex: '0 0 65%', overflow: 'hidden', background: '#000' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={VIDEO_URL}
          alt="Camera feed"
          crossOrigin="anonymous"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <CanvasOverlay
          detections={detections}
          zoneConfig={zoneConfig}
          zoneStatus={zoneStatus}
        />

        {/* Camera info overlay bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0,0,0,0.7)',
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
            <span style={{ color: camConnected ? 'var(--green)' : 'var(--red)' }}>●</span>{' '}
            {cameraInfo?.name ?? 'Camera'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {cameraInfo?.resolution ?? '—'}
          </span>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'var(--green)',
              background: 'rgba(0,255,136,0.1)',
              padding: '1px 6px',
              borderRadius: '3px',
            }}
          >
            FPS: {fps}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div
        style={{
          flex: '1',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* Info chips row 1 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            ['DEVICE', cameraInfo?.name ?? 'MacBook Webcam'],
            ['RES', cameraInfo?.resolution ?? '1280×720'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                flex: 1,
                borderBottom: '1px solid var(--border)',
                paddingBottom: '5px',
              }}
            >
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                {label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Info chips row 2 */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            ['MODEL', 'YOLOv8n'],
            ['ACCEL', 'Apple MPS'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                flex: 1,
                borderBottom: '1px solid var(--border)',
                paddingBottom: '5px',
              }}
            >
              <div style={{ fontSize: '9px', color: 'var(--text-secondary)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                {label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Inference time */}
        <div style={{ marginTop: 'auto' }}>
          <span
            className="mono"
            style={{ fontSize: '13px', color: 'var(--green)' }}
          >
            INFERENCE: {inferenceMs}ms
          </span>
        </div>
      </div>
    </div>
  )
}
