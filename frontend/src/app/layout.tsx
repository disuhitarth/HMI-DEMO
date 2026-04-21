'use client'

import { useEffect, useState } from 'react'
import './globals.css'
import { useDetectionSocket } from '@/hooks/useDetectionSocket'
import { useFailAlert } from '@/hooks/useFailAlert'

function GlobalHooks() {
  useDetectionSocket()
  useFailAlert()
  return null
}

function Header() {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
      setDate(
        now
          .toLocaleDateString('en-US', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          .toUpperCase()
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header
      style={{
        height: '56px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      {/* Left — Logo */}
      <div style={{ width: '20%', display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '110px',
            height: '36px',
            border: '1px dashed var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1px',
          }}
        >
          <span
            className="orbitron"
            style={{
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
            }}
          >
            MEGHNA CO.
          </span>
          <span
            style={{
              fontSize: '8px',
              color: 'var(--text-secondary)',
              fontFamily: 'monospace',
            }}
          >
            // LOGO PLACEHOLDER
          </span>
        </div>
      </div>

      {/* Center — Title */}
      <div
        style={{
          width: '60%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span
          className="orbitron"
          style={{
            fontSize: '18px',
            letterSpacing: '0.3em',
            color: 'var(--text-primary)',
          }}
        >
          QC VISION SYSTEM
        </span>
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '0.25em',
            color: 'var(--text-secondary)',
            fontFamily: 'Rajdhani, sans-serif',
            marginTop: '1px',
          }}
        >
          AUTOMOTIVE PARTS INSPECTION — DEMO MODE
        </span>
      </div>

      {/* Right — Clock */}
      <div
        style={{
          width: '20%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: 'var(--text-secondary)',
            fontFamily: 'Rajdhani, sans-serif',
            letterSpacing: '0.1em',
          }}
        >
          {date}
        </span>
        <span
          className="mono"
          style={{ fontSize: '20px', color: 'var(--text-primary)', lineHeight: 1 }}
        >
          {time}
        </span>
      </div>
    </header>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="animate-scanline">
        <GlobalHooks />
        <Header />
        <main
          style={{
            paddingTop: '56px',
            paddingBottom: '32px',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}
