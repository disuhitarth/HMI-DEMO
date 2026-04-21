'use client'

import { useEffect, useRef } from 'react'
import { useDetectionStore } from '@/store/detectionStore'
import { parseDetectionFrame } from '@/validators/detectionSchema'
import { WS_URL } from '@/lib/constants'

export function useDetectionSocket() {
  const setData = useDetectionStore((s) => s.setData)
  const setConnected = useDetectionStore((s) => s.setConnected)
  const wsRef = useRef<WebSocket | null>(null)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountedRef = useRef(false)

  useEffect(() => {
    unmountedRef.current = false

    function connect() {
      if (unmountedRef.current) return

      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
      }

      ws.onmessage = (evt) => {
        try {
          const raw = JSON.parse(evt.data)
          const parsed = parseDetectionFrame(raw)
          if (parsed) setData(parsed)
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        setConnected(false)
        if (!unmountedRef.current) {
          retryRef.current = setTimeout(connect, 2500)
        }
      }

      ws.onerror = () => {
        setConnected(false)
        ws.close()
      }
    }

    connect()

    return () => {
      unmountedRef.current = true
      if (retryRef.current) clearTimeout(retryRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [setData, setConnected])
}
