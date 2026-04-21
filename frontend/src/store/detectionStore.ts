import { create } from 'zustand'
import type { DetectionFrame } from '@/types/detection'

interface DetectionState {
  data: DetectionFrame | null
  connected: boolean
  isRunning: boolean
  sessionStart: Date | null
  setData: (d: DetectionFrame) => void
  setConnected: (c: boolean) => void
  setRunning: (r: boolean) => void
  setSessionStart: (d: Date | null) => void
}

export const useDetectionStore = create<DetectionState>()((set) => ({
  data: null,
  connected: false,
  isRunning: false,
  sessionStart: null,
  setData: (d) => set({ data: d }),
  setConnected: (c) => set({ connected: c }),
  setRunning: (r) => set({ isRunning: r }),
  setSessionStart: (d) => set({ sessionStart: d }),
}))
