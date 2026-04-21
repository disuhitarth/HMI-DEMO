export type ZoneStatus = 'PASS' | 'FAIL' | 'IN_ZONE' | 'IDLE'

export interface Detection {
  class: string
  confidence: number
  bbox: [number, number, number, number]
  centroid: [number, number]
}

export interface ZoneConfig {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface CameraInfo {
  name: string
  resolution: string
  fps_target: number
  status: 'CONNECTED' | 'DISCONNECTED'
}

export interface SessionStats {
  total: number
  pass_count: number
  fail_count: number
  pass_rate: number
  avg_dwell: number
}

export interface InspectionLog {
  id: number
  timestamp_in: string
  timestamp_out: string | null
  dwell_seconds: number | null
  object_class: string
  confidence: number
  result: 'PASS' | 'FAIL'
  llm_desc: string | null
}

export interface DetectionFrame {
  fps: number
  inference_ms: number
  detections: Detection[]
  zone_status: ZoneStatus
  pass_fail: ZoneStatus
  current_object: string | null
  confidence: number | null
  entry_time: string | null
  exit_time: string | null
  dwell_seconds: number | null
  llm_description: string | null
  alert: boolean
  zone_config: ZoneConfig
  camera_info: CameraInfo
  session_stats: SessionStats
  recent_logs: InspectionLog[]
  is_running: boolean
  timestamp: string
}
