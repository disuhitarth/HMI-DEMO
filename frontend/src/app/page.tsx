'use client'

import CameraFeed from '@/components/CameraFeed'
import SimulatedCameras from '@/components/SimulatedCameras'
import PassFailDisplay from '@/components/PassFailDisplay'
import ControlButtons from '@/components/ControlButtons'
import KpiPanel from '@/components/KpiPanel'
import LogTable from '@/components/LogTable'
import StatusBar from '@/components/StatusBar'
import AlertFlash from '@/components/AlertFlash'

const PAD = '10px'
const GAP = '8px'

export default function Page() {
  return (
    <>
      <div
        style={{
          display: 'flex',
          height: '100%',
          gap: GAP,
          padding: PAD,
        }}
      >
        {/* LEFT COLUMN — 36% */}
        <div
          style={{
            width: '36%',
            display: 'flex',
            flexDirection: 'column',
            gap: GAP,
            minWidth: 0,
          }}
        >
          {/* Camera feed — 55% */}
          <div style={{ flex: '0 0 55%', minHeight: 0 }}>
            <CameraFeed />
          </div>
          {/* Network Feeds panel — 45% */}
          <div style={{ flex: '1', minHeight: 0 }}>
            <SimulatedCameras />
          </div>
        </div>

        {/* CENTER COLUMN — 28% */}
        <div
          style={{
            width: '28%',
            display: 'flex',
            flexDirection: 'column',
            gap: GAP,
            minWidth: 0,
          }}
        >
          {/* Pass/Fail display — ~42% */}
          <div style={{ flex: '0 0 42%', minHeight: 0 }}>
            <PassFailDisplay />
          </div>
          {/* Control buttons — fixed */}
          <div style={{ flexShrink: 0 }}>
            <ControlButtons />
          </div>
          {/* KPI grid — remaining */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <KpiPanel />
          </div>
        </div>

        {/* RIGHT COLUMN — 36% */}
        <div
          style={{
            width: '36%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <LogTable />
        </div>
      </div>

      <StatusBar />
      <AlertFlash />
    </>
  )
}
