'use client'

import { useEffect, useRef } from 'react'
import { useDetectionStore } from '@/store/detectionStore'

export function useFailAlert() {
  const alert = useDetectionStore((s) => s.data?.alert ?? false)
  const prevAlertRef = useRef(false)

  useEffect(() => {
    if (alert && !prevAlertRef.current) {
      try {
        const ctx = new AudioContext()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'square'
        osc.frequency.value = 880
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.start()
        osc.stop(ctx.currentTime + 0.3)
      } catch {
        // AudioContext not available
      }
    }
    prevAlertRef.current = alert
  }, [alert])
}
