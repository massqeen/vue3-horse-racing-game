import type { Horse, Round, RoundResult, HorseProgress } from './types'
import {
  BASE_SPEED,
  SIMULATION_TICK_MS,
  BASE_CONDITION,
  CONDITION_MAX,
  CONDITION_SPEED_FACTOR,
  MIN_VARIATION,
  VARIATION_RANGE,
  START_BURST_DURATION_PERCENT,
  MIN_DAILY_FORM,
  DAILY_FORM_RANGE,
  MIN_START_BURST,
  START_BURST_RANGE,
  STAMINA_ACTIVATION_PERCENT,
  ELITE_STAMINA_MIN,
  ELITE_STAMINA_BOOST,
  VERY_GOOD_STAMINA_MIN,
  VERY_GOOD_STAMINA_BOOST,
  GOOD_STAMINA_MIN,
  BELOW_AVERAGE_STAMINA_MIN,
  BELOW_AVERAGE_STAMINA_PENALTY,
  LOW_STAMINA_PENALTY,
} from './constants'
import { createSeededRandom } from './rng'

// Calculate speed based on horse condition and random variation
// Balanced: condition matters but randomness creates excitement
// Range 80-100: only 20 point difference, fair for random upsets
function calculateSpeed(
  horse: Horse,
  random: () => number,
  tickCount: number,
  raceProgress: number, // 0-100% of race completed
  dailyForm: number, // Horse's form today (±5%)
  startBurst: number, // Start burst bonus (±8%, only active 0-20%)
): number {
  // Reduced condition impact (0.15 instead of 0.2) to compensate for stamina effect
  const conditionFactor = 1 + ((horse.condition - BASE_CONDITION) / CONDITION_MAX) * CONDITION_SPEED_FACTOR

  // High random variation per tick (±20%)
  const variation = MIN_VARIATION + random() * VARIATION_RANGE

  // Daily form - how "in form" the horse is today (applies whole race)
  const formFactor = dailyForm

  // Start burst - only active in first 20% of race
  const burstFactor = raceProgress <= START_BURST_DURATION_PERCENT ? startBurst : 1.0

  // Non-linear stamina effect based on race progress
  const staminaEffect = calculateStaminaEffect(horse.condition, raceProgress)

  return BASE_SPEED * conditionFactor * formFactor * burstFactor * variation * staminaEffect
}

// Calculate stamina effect based on condition and race progress
// High stamina horses get sprint boost near finish
// Low stamina horses fatigue heavily near finish
function calculateStaminaEffect(condition: number, progress: number): number {
  // No effect at start (progress < 50%)
  if (progress < STAMINA_ACTIVATION_PERCENT) {
    return 1.0
  }

  // Calculate how far into the "endurance zone" we are (50-100%)
  const enduranceProgress = (progress - STAMINA_ACTIVATION_PERCENT) / (100 - STAMINA_ACTIVATION_PERCENT) // 0 to 1

  // Determine stamina category
  if (condition >= ELITE_STAMINA_MIN) {
    // Elite stamina: finish sprint (+0% at 50% → +5% at 100%)
    return 1.0 + enduranceProgress * ELITE_STAMINA_BOOST
  } else if (condition >= VERY_GOOD_STAMINA_MIN) {
    // Very good stamina: small boost (+0% → +2%)
    return 1.0 + enduranceProgress * VERY_GOOD_STAMINA_BOOST
  } else if (condition >= GOOD_STAMINA_MIN) {
    // Good stamina: stable (no change)
    return 1.0
  } else if (condition >= BELOW_AVERAGE_STAMINA_MIN) {
    // Below average: light fatigue (0% → -3%)
    return 1.0 - enduranceProgress * BELOW_AVERAGE_STAMINA_PENALTY
  } else {
    // Low stamina: heavy fatigue (0% → -10%)
    return 1.0 - enduranceProgress * LOW_STAMINA_PENALTY
  }
}

export class RaceSimulation {
  private round: Round
  private random: () => number
  private progress: Map<number, number>
  private lanes: Map<number, number>
  private dailyForm: Map<number, number> // Horse's daily form (applies whole race, ±5%)
  private startBurst: Map<number, number> // Start burst (applies 0-20%, ±8%)
  private startTime: number
  private tickCount: number
  private finished: Set<number>
  private finishTimes: Map<number, number>
  private finishedPositions: Map<number, number> // Cached positions for finished horses

  constructor(round: Round, seed: number = Date.now()) {
    this.round = round
    this.random = createSeededRandom(seed)
    this.progress = new Map()
    this.lanes = new Map()
    this.dailyForm = new Map()
    this.startBurst = new Map()
    this.finished = new Set()
    this.finishTimes = new Map()
    this.finishedPositions = new Map() // Initialize cache
    this.startTime = Date.now()
    this.tickCount = 0

    // Initialize all horses with random daily form and start burst
    round.horses.forEach(({ horse, lane }) => {
      this.progress.set(horse.id, 0)
      this.lanes.set(horse.id, lane)

      // Daily form: ±5% (how "in form" the horse is today, applies whole race)
      this.dailyForm.set(horse.id, MIN_DAILY_FORM + this.random() * DAILY_FORM_RANGE)

      // Start burst: ±8% (explosive start or slow start, applies 0-20% only)
      this.startBurst.set(horse.id, MIN_START_BURST + this.random() * START_BURST_RANGE)
    })
  }

  // Update simulation by one tick
  tick(): void {
    this.tickCount++
    const elapsedMs = Date.now() - this.startTime

    this.round.horses.forEach(({ horse }) => {
      if (this.finished.has(horse.id)) {
        return
      }

      const currentDistance = this.progress.get(horse.id) || 0
      const raceProgress = (currentDistance / this.round.distance) * 100 // 0-100%

      const dailyForm = this.dailyForm.get(horse.id) || 1
      const startBurst = this.startBurst.get(horse.id) || 1
      const speed = calculateSpeed(horse, this.random, this.tickCount, raceProgress, dailyForm, startBurst)
      const distanceDelta = speed * (SIMULATION_TICK_MS / 1000)

      const newDistance = currentDistance + distanceDelta

      if (newDistance >= this.round.distance) {
        this.progress.set(horse.id, this.round.distance)
        this.finished.add(horse.id)
        this.finishTimes.set(horse.id, elapsedMs)

        // Update cached position when horse finishes
        this.finishedPositions.set(horse.id, this.finished.size)
      } else {
        this.progress.set(horse.id, newDistance)
      }
    })
  }

  // ...existing code...

  getProgress(): HorseProgress[] {
    // Use cached positions instead of sorting on every call
    // finishedPositions is updated incrementally in tick()
    return this.round.horses.map(({ horse }) => {
      const distance = this.progress.get(horse.id) || 0
      const position = (distance / this.round.distance) * 100
      const lane = this.lanes.get(horse.id) || 1
      const finishPosition = this.finishedPositions.get(horse.id)

      return {
        horseId: horse.id,
        lane,
        position: Math.min(100, position),
        speed: 0, // Speed is internal, not exposed in current design
        finishPosition, // undefined if not finished, 1-10 if finished
      }
    })
  }

  // Check if race is complete
  isComplete(): boolean {
    return this.finished.size === this.round.horses.length
  }

  // Get final results
  getResults(): RoundResult {
    const sortedFinishes = Array.from(this.finishTimes.entries())
      .sort((a, b) => {
        // Primary sort: by finish time
        const timeDiff = a[1] - b[1]
        if (timeDiff !== 0) return timeDiff
        // Secondary sort (tie-breaker): by lane number (lower lane wins in tie)
        const horseA = this.round.horses.find((h) => h.horse.id === a[0])!
        const horseB = this.round.horses.find((h) => h.horse.id === b[0])!
        return horseA.lane - horseB.lane
      })

    // First pass: create rankings with sequential positions
    const rankings = sortedFinishes.map(([horseId, timeMs], index) => {
      const horseInLane = this.round.horses.find((h) => h.horse.id === horseId)!

      return {
        position: index + 1, // Temporary position
        horse: horseInLane.horse,
        lane: horseInLane.lane,
        time: timeMs / 1000,
      }
    })

    // Second pass: adjust positions for ties
    for (let i = 1; i < rankings.length; i++) {
      const current = rankings[i]!
      const previous = rankings[i - 1]!

      // If same time (within 1ms), use same position as previous
      if (Math.abs(current.time - previous.time) < 0.001) {
        current.position = previous.position
      }
    }

    return {
      roundNumber: this.round.roundNumber,
      distance: this.round.distance,
      rankings,
    }
  }
}

