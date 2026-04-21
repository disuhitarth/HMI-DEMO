'use client'

import { useDetectionStore } from '@/store/detectionStore'
import { formatTimestamp, formatDwell, formatConfidence } from '@/lib/formatters'
import type { InspectionLog } from '@/types/detection'

function ResultBadge({ result }: { result: 'PASS' | 'FAIL' }) {
  const isPass = result === 'PASS'
  return (
    <span
      style={{
        padding: '1px 7px',
        borderRadius: '3px',
        fontSize: '10px',
        fontFamily: 'monospace',
        fontWeight: 600,
        background: isPass ? 'rgba(0,255,136,0.13)' : 'rgba(255,34,68,0.13)',
        color: isPass ? 'var(--green)' : 'var(--red)',
        border: `1px solid ${isPass ? 'rgba(0,255,136,0.27)' : 'rgba(255,34,68,0.27)'}`,
      }}
    >
      {result}
    </span>
  )
}

const COL_WIDTHS = ['40px', '70px', '70px', '50px', '80px', '45px', '55px']
const HEADERS = ['ID', 'TIME IN', 'TIME OUT', 'DWELL', 'OBJECT', 'CONF', 'RESULT']

function Row({ log, even }: { log: InspectionLog; even: boolean }) {
  return (
    <tr
      style={{
        background: even ? 'var(--card)' : 'var(--surface)',
      }}
    >
      <td
        className="mono"
        style={{ padding: '4px 6px', fontSize: '10px', color: 'var(--text-secondary)', width: COL_WIDTHS[0] }}
      >
        #{String(log.id).padStart(3, '0')}
      </td>
      <td className="mono" style={{ padding: '4px 6px', fontSize: '10px', color: 'var(--text-primary)', width: COL_WIDTHS[1] }}>
        {formatTimestamp(log.timestamp_in)}
      </td>
      <td className="mono" style={{ padding: '4px 6px', fontSize: '10px', color: 'var(--text-primary)', width: COL_WIDTHS[2] }}>
        {formatTimestamp(log.timestamp_out)}
      </td>
      <td className="mono" style={{ padding: '4px 6px', fontSize: '10px', color: 'var(--text-primary)', width: COL_WIDTHS[3] }}>
        {formatDwell(log.dwell_seconds)}
      </td>
      <td
        style={{
          padding: '4px 6px',
          fontSize: '11px',
          color: 'var(--text-primary)',
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 600,
          textTransform: 'capitalize',
          width: COL_WIDTHS[4],
        }}
      >
        {log.object_class}
      </td>
      <td className="mono" style={{ padding: '4px 6px', fontSize: '10px', color: 'var(--text-secondary)', width: COL_WIDTHS[5] }}>
        {formatConfidence(log.confidence)}
      </td>
      <td style={{ padding: '4px 6px', width: COL_WIDTHS[6] }}>
        <ResultBadge result={log.result} />
      </td>
    </tr>
  )
}

export default function LogTable() {
  const logs = useDetectionStore((s) => s.data?.recent_logs) ?? []

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.12em',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          INSPECTION LOG
        </span>
        <span
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1px 10px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            fontFamily: 'monospace',
          }}
        >
          {logs.length}
        </span>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '6px',
              color: 'var(--text-secondary)',
            }}
          >
            <div style={{ fontFamily: 'monospace', fontSize: '16px' }}>◌ NO INSPECTIONS LOGGED</div>
            <div style={{ fontSize: '12px', fontFamily: 'Rajdhani, sans-serif' }}>
              Start inspection to begin logging.
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr
                style={{
                  background: 'var(--surface)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                {HEADERS.map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '5px 6px',
                      fontSize: '9px',
                      color: 'var(--text-secondary)',
                      fontFamily: 'Rajdhani, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      textAlign: 'left',
                      fontWeight: 500,
                      borderBottom: '1px solid var(--border)',
                      width: COL_WIDTHS[i],
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <Row key={log.id} log={log} even={i % 2 === 0} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
