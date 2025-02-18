export interface Horse {
  id: number
  name: string
  color: string
  condition: number // 80-100 (elite competitive horses only)
}

export interface HorseInLane {
  horse: Horse
  lane: number // 1-10
}

export interface Round {
  roundNumber: number
  distance: number // meters
  horses: HorseInLane[] // Horses with assigned lanes
}

export interface HorseProgress {
  horseId: number
  lane: number
  position: number // 0-100 (percentage of distance)
  speed: number
  finishPosition?: number // Position when finished (1st, 2nd, 3rd, etc.)
}

export interface RoundResult {
  roundNumber: number
  distance: number
  rankings: {
    position: number
    horse: Horse
    lane: number
    time: number // seconds
  }[]
}

export type AppPhase = 'idle' | 'generated' | 'running' | 'finished'

