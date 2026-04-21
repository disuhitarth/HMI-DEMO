'use client'

import { useEffect, useRef, useState } from 'react'

const FEEDS = [
  { id: 'CAM-02', name: 'ASSEMBLY LINE B', status: 'ACTIVE', color: '#00ff88', obj: 'Bolt', conf: 0.91 },
  { id: 'CAM-03', name: 'PACKAGING UNIT D', status: 'ACTIVE', color: '#00ff88', obj: 'Cap', conf: 0.87 },
  { id: 'CAM-04', name: 'LOADING DOCK', status: 'STANDBY', color: '#888', obj: null, conf: 0 },
]

function MiniCamCanvas({ feed, tick }: { feed: typeof FEEDS[0]; tick: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width
    const H = canvas.height

    // Background
    ctx.fillStyle = '#080c10'
    ctx.fillRect(0, 0, W, H)

    if (feed.status !== 'ACTIVE') {
      // Standby: static noise
      for (let i = 0; i < 800; i++) {
        const x = Math.random() * W
        const y = Math.random() * H
        const v = Math.floor(Math.random() * 60)
        ctx.fillStyle = `rgb(${v},${v},${v})`
        ctx.fillRect(x, y, 1.5, 1.5)
      }
      ctx.fillStyle = 'rgba(0,0,0,0.5)'
      ctx.fillRect(0, 0, W, H)
      ctx.font = 'bold 10px monospace'
      ctx.fillStyle = '#555'
      ctx.textAlign = 'center'
      ctx.fillText('NO SIGNAL', W / 2, H / 2)
      return
    }

    // Draw subtle noise texture
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.018})`
      ctx.fillRect(x, y, 1, 1)
    }

    // Draw a fake conveyor belt
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.lineWidth = 1
    for (let y = 10; y < H; y += 14) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    // Moving belt lines
    const beltOffset = (tick * 3) % 14
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1
    for (let y = -14 + beltOffset; y < H; y += 14) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(W, y)
      ctx.stroke()
    }

    // Draw fake object on belt
    const objX = 15 + ((tick * 2) % (W - 50))
    const objY = H / 2 - 10
    const objW = 28
    const objH = 18

    // Object glow
    const grd = ctx.createRadialGradient(objX + objW / 2, objY + objH / 2, 2, objX + objW / 2, objY + objH / 2, 30)
    grd.addColorStop(0, 'rgba(0,255,136,0.18)')
    grd.addColorStop(1, 'rgba(0,255,136,0)')
    ctx.fillStyle = grd
    ctx.fillRect(objX - 10, objY - 10, objW + 20, objH + 20)

    // Object body
    ctx.fillStyle = 'rgba(60,80,70,0.9)'
    ctx.fillRect(objX, objY, objW, objH)
    ctx.strokeStyle = feed.color
    ctx.lineWidth = 1.5
    ctx.strokeRect(objX, objY, objW, objH)

    // Detection box (blinking)
    if (tick % 4 !== 0) {
      ctx.strokeStyle = feed.color
      ctx.lineWidth = 1
      ctx.setLineDash([3, 2])
      ctx.strokeRect(objX - 5, objY - 5, objW + 10, objH + 10)
      ctx.setLineDash([])
    }

    // Confidence label on object
    ctx.font = '7px monospace'
    ctx.fillStyle = feed.color
    ctx.textAlign = 'left'
    ctx.fillText(`${(feed.conf * 100).toFixed(0)}%`, objX + 2, objY - 3)

    // Scan line sweep
    const scanY = ((tick * 4) % H)
    const scanGrd = ctx.createLinearGradient(0, scanY - 6, 0, scanY + 6)
    scanGrd.addColorStop(0, 'rgba(0,255,136,0)')
    scanGrd.addColorStop(0.5, 'rgba(0,255,136,0.15)')
    scanGrd.addColorStop(1, 'rgba(0,255,136,0)')
    ctx.fillStyle = scanGrd
    ctx.fillRect(0, scanY - 6, W, 12)

    // Corner brackets
    const bLen = 8
    ctx.strokeStyle = 'rgba(0,255,136,0.5)'
    ctx.lineWidth = 1.5
    const corners = [[0, 0], [W, 0], [0, H], [W, H]]
    corners.forEach(([cx, cy]) => {
      ctx.beginPath()
      ctx.moveTo(cx === 0 ? cx : cx - bLen, cy)
      ctx.lineTo(cx === 0 ? cx + bLen : cx, cy)
      ctx.moveTo(cx, cy === 0 ? cy : cy - bLen)
      ctx.lineTo(cx, cy === 0 ? cy + bLen : cy)
      ctx.stroke()
    })
  }, [feed, tick])

  return (
    <canvas
      ref={canvasRef}
      width={180}
      height={80}
      style={{ width: '100%', height: '80px', display: 'block', borderRadius: '3px' }}
    />
  )
}

export default function SimulatedCameras() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 120)
    return () => clearInterval(id)
  }, [])

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
          NETWORK FEEDS
        </span>
        <span style={{ fontSize: '10px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '10px', padding: '1px 8px', color: 'var(--green)', fontFamily: 'monospace' }}>
          ● 2 ACTIVE
        </span>
      </div>

      {/* Camera list */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        {FEEDS.map((feed) => (
          <div
            key={feed.id}
            style={{
              background: 'var(--surface)',
              border: `1px solid ${feed.status === 'ACTIVE' ? 'rgba(0,255,136,0.2)' : 'var(--border)'}`,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {/* Top label bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 6px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                <span style={{ color: feed.color, marginRight: '4px' }}>●</span>
                {feed.id} — {feed.name}
              </span>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: feed.status === 'ACTIVE' ? 'var(--green)' : 'var(--text-secondary)' }}>
                {feed.status}
              </span>
            </div>

            {/* Canvas */}
            <MiniCamCanvas feed={feed} tick={tick} />

            {/* Bottom stats bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 6px', borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                {feed.obj ? `OBJ: ${feed.obj}` : 'OBJ: —'}
              </span>
              <span style={{ fontSize: '9px', fontFamily: 'monospace', color: feed.color }}>
                {feed.conf > 0 ? `CONF: ${(feed.conf * 100).toFixed(0)}%` : '—'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
