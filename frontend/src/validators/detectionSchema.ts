import { z } from 'zod'
import type { DetectionFrame } from '@/types/detection'

const DetectionSchema = z.object({
  class: z.string(),
  confidence: z.number(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  centroid: z.tuple([z.number(), z.number()]),
})

const ZoneConfigSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
})

const CameraInfoSchema = z.object({
  name: z.string(),
  resolution: z.string(),
  fps_target: z.number(),
  status: z.enum(['CONNECTED', 'DISCONNECTED']),
})

const SessionStatsSchema = z.object({
  total: z.number(),
  pass_count: z.number(),
  fail_count: z.number(),
  pass_rate: z.number(),
  avg_dwell: z.number(),
})

const InspectionLogSchema = z.object({
  id: z.number(),
  timestamp_in: z.string(),
  timestamp_out: z.string().nullable(),
  dwell_seconds: z.number().nullable(),
  object_class: z.string(),
  confidence: z.number(),
  result: z.enum(['PASS', 'FAIL']),
  llm_desc: z.string().nullable(),
})

export const DetectionFrameSchema = z.object({
  fps: z.number(),
  inference_ms: z.number(),
  detections: z.array(DetectionSchema),
  zone_status: z.enum(['PASS', 'FAIL', 'IN_ZONE', 'IDLE']),
  pass_fail: z.enum(['PASS', 'FAIL', 'IN_ZONE', 'IDLE']),
  current_object: z.string().nullable(),
  confidence: z.number().nullable(),
  entry_time: z.string().nullable(),
  exit_time: z.string().nullable(),
  dwell_seconds: z.number().nullable(),
  llm_description: z.string().nullable(),
  alert: z.boolean(),
  zone_config: ZoneConfigSchema,
  camera_info: CameraInfoSchema,
  session_stats: SessionStatsSchema,
  recent_logs: z.array(InspectionLogSchema),
  is_running: z.boolean(),
  timestamp: z.string(),
})

export function parseDetectionFrame(raw: unknown): DetectionFrame | null {
  const result = DetectionFrameSchema.safeParse(raw)
  if (result.success) return result.data as DetectionFrame
  return null
}
