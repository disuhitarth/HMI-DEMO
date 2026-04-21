'use client'

import { useEffect, useRef, useState } from 'react'
import type { Detection, ZoneConfig, ZoneStatus } from '@/types/detection'

interface Props {
  detections: Detection[]
  zoneConfig: ZoneConfig
  zoneStatus: ZoneStatus
}

function getZoneColor(status: ZoneStatus): string {
  switch (status) {
    case 'IN_ZONE': return '#ffaa00'
    case 'PASS': return '#00ff88'
    case 'FAIL': return '#ff2244'
    default: return 'rgba(255,255,255,0.4)'
  }
}

function drawBracketRect(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  bracketLen: number = 20
) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()

  // Top-left corner
  ctx.moveTo(x1, y1 + bracketLen)
  ctx.lineTo(x1, y1)
  ctx.lineTo(x1 + bracketLen, y1)

  // Top-right corner
  ctx.moveTo(x2 - bracketLen, y1)
  ctx.lineTo(x2, y1)
  ctx.lineTo(x2, y1 + bracketLen)

  // Bottom-left corner
  ctx.moveTo(x1, y2 - bracketLen)
  ctx.lineTo(x1, y2)
  ctx.lineTo(x1 + bracketLen, y2)

  // Bottom-right corner
  ctx.moveTo(x2 - bracketLen, y2)
  ctx.lineTo(x2, y2)
  ctx.lineTo(x2, y2 - bracketLen)

  ctx.stroke()
}

export default function CanvasOverlay({ detections, zoneConfig, zoneStatus }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  
  // Local dragging state
  const [isDragging, setIsDragging] = useState(false)
  const [localZone, setLocalZone] = useState<ZoneConfig | null>(null)
  const dragStart = useRef({ x: 0, y: 0 })

  // Use local zone if dragging, else use remote zone
  const activeZone = isDragging && localZone ? localZone : zoneConfig
  const propsRef = useRef({ detections, activeZone, zoneStatus })

  useEffect(() => {
    propsRef.current = { detections, activeZone, zoneStatus }
  }, [detections, activeZone, zoneStatus])

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function draw() {
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const rect = canvas.getBoundingClientRect()
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width
        canvas.height = rect.height
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const { detections, activeZone: zc, zoneStatus } = propsRef.current
      const { x1, y1, x2, y2 } = zc
      // Ensure x1 < x2 and y1 < y2 for drawing
      const rx1 = Math.min(x1, x2) * canvas.width
      const ry1 = Math.min(y1, y2) * canvas.height
      const rx2 = Math.max(x1, x2) * canvas.width
      const ry2 = Math.max(y1, y2) * canvas.height
      const color = getZoneColor(zoneStatus)

      // Semi-transparent fill for active states
      if (zoneStatus === 'IN_ZONE' || zoneStatus === 'PASS') {
        ctx.fillStyle = 'rgba(0,255,136,0.05)'
        ctx.fillRect(rx1, ry1, rx2 - rx1, ry2 - ry1)
      }
      if (zoneStatus === 'FAIL') {
        ctx.fillStyle = 'rgba(255,34,68,0.05)'
        ctx.fillRect(rx1, ry1, rx2 - rx1, ry2 - ry1)
      }

      // If dragging, hint that it's being edited
      if (isDragging) {
        ctx.fillStyle = 'rgba(255,255,255,0.1)'
        ctx.fillRect(rx1, ry1, rx2 - rx1, ry2 - ry1)
        drawBracketRect(ctx, rx1, ry1, rx2, ry2, '#00bfff')
        ctx.font = '11px "Share Tech Mono", monospace'
        ctx.fillStyle = '#00bfff'
        ctx.fillText('EDITING ZONE', rx1, ry1 - 6)
      } else {
        // Zone bracket corners
        drawBracketRect(ctx, rx1, ry1, rx2, ry2, color)
        // Zone label
        ctx.font = '11px "Share Tech Mono", monospace'
        ctx.fillStyle = color
        ctx.fillText('INSPECTION ZONE', rx1, ry1 - 6)
      }

      // Detection centroids
      if (detections.length > 0) {
        detections.forEach((det) => {
          const [cx, cy] = det.centroid
          ctx.beginPath()
          ctx.arc(cx, cy, 4, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
        })
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isDragging])

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    
    setIsDragging(true)
    dragStart.current = { x, y }
    setLocalZone({ x1: x, y1: y, x2: x, y2: y })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setLocalZone({
      x1: dragStart.current.x,
      y1: dragStart.current.y,
      x2: x,
      y2: y
    })
  }

  const handleMouseUp = async () => {
    if (!isDragging || !localZone) return
    setIsDragging(false)
    
    // Normalize coordinates so x1 < x2 and y1 < y2
    const finalZone = {
      x1: Math.min(localZone.x1, localZone.x2),
      y1: Math.min(localZone.y1, localZone.y2),
      x2: Math.max(localZone.x1, localZone.x2),
      y2: Math.max(localZone.y1, localZone.y2)
    }
    
    setLocalZone(null)
    
    // Save to backend
    try {
      await fetch('http://localhost:8000/zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalZone)
      })
    } catch(err) {
      console.error("Failed to update zone config", err)
    }
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        cursor: 'crosshair',
        // Enable pointer events to interact!
        pointerEvents: 'auto',
      }}
    />
  )
}

