'use client'

import { useEffect, useRef, useState } from 'react'
import { useDetectionStore } from '@/store/detectionStore'

export default function AlertFlash() {
  const alert = useDetectionStore((s) => s.data?.alert ?? false)
  const [visible, setVisible] = useState(false)
  const [bannerSliding, setBannerSliding] = useState<'down' | 'up' | 'hidden'>('hidden')
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (alert) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(600, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      } catch (e) {
        // Ignore audio error
      }

      // Clear any pending hide
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)

      setVisible(true)
      setBannerSliding('down')

      // Hide overlay after 800ms
      hideTimeoutRef.current = setTimeout(() => setVisible(false), 800)

      // Slide banner back up after 1200ms
      bannerTimeoutRef.current = setTimeout(() => {
        setBannerSliding('up')
        setTimeout(() => setBannerSliding('hidden'), 300)
      }, 1200)
    }

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current)
    }
  }, [alert])

  if (!visible && bannerSliding === 'hidden') return null

  return (
    <>
      {/* Full screen flash overlay */}
      {visible && (
        <div
          className="animate-screen-flash"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255,34,68,0.15)',
            pointerEvents: 'none',
            zIndex: 200,
          }}
        />
      )}

      {/* Top banner */}
      {bannerSliding !== 'hidden' && (
        <div
          className={bannerSliding === 'down' ? 'animate-slide-down' : 'animate-slide-up'}
          style={{
            position: 'fixed',
            top: '56px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--red)',
            color: '#fff',
            padding: '8px 32px',
            borderRadius: '0 0 6px 6px',
            zIndex: 201,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span
            className="orbitron"
            style={{ fontSize: '14px', letterSpacing: '0.2em' }}
          >
            ⚠ INSPECTION FAILED
          </span>
        </div>
      )}
    </>
  )
}
