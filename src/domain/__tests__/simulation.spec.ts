import { describe, it, expect, beforeEach } from 'vitest'
import { RaceSimulation } from '@/domain/simulation'
import type { Round } from '@/domain/types'

describe('RaceSimulation', () => {
  let mockRound: Round

  beforeEach(() => {
    mockRound = {
      roundNumber: 1,
      distance: 1200,
      horses: [
        { horse: { id: 1, name: 'Thunder', color: '#FF6B6B', condition: 95 }, lane: 5 },
        { horse: { id: 2, name: 'Lightning', color: '#4ECDC4', condition: 87 }, lane: 6 },
        { horse: { id: 3, name: 'Storm', color: '#45B7D1', condition: 80 }, lane: 1 },
      ],
    }
  })

  it('should initialize with all horses at start', () => {
    const simulation = new RaceSimulation(mockRound, 12345)
    const progress = simulation.getProgress()

    expect(progress).toHaveLength(3)
    progress.forEach((p) => {
      expect(p.position).toBe(0)
    })
  })

  it('should not be complete at start', () => {
    const simulation = new RaceSimulation(mockRound, 12345)
    expect(simulation.isComplete()).toBe(false)
  })

  it('should update progress after tick', () => {
    const simulation = new RaceSimulation(mockRound, 12345)
    simulation.tick()
    const progress = simulation.getProgress()

    progress.forEach((p) => {
      expect(p.position).toBeGreaterThan(0)
    })
  })

  it('should eventually complete after enough ticks', () => {
    const simulation = new RaceSimulation(mockRound, 12345)

    // Run simulation for max expected time (increased due to higher randomness)
    for (let i = 0; i < 2000; i++) {
      if (simulation.isComplete()) break
      simulation.tick()
    }

    expect(simulation.isComplete()).toBe(true)
  })

  it('should have all horses at 100% when complete', () => {
    const simulation = new RaceSimulation(mockRound, 12345)

    while (!simulation.isComplete()) {
      simulation.tick()
    }

    const progress = simulation.getProgress()
    progress.forEach((p) => {
      expect(p.position).toBe(100)
    })
  })

  it('should produce results with correct rankings', () => {
    const simulation = new RaceSimulation(mockRound, 12345)

    while (!simulation.isComplete()) {
      simulation.tick()
    }

    const results = simulation.getResults()

    expect(results.roundNumber).toBe(1)
    expect(results.distance).toBe(1200)
    expect(results.rankings).toHaveLength(3)

    // Check positions are non-decreasing (allowing ties)
    for (let i = 1; i < results.rankings.length; i++) {
      expect(results.rankings[i]!.position).toBeGreaterThanOrEqual(
        results.rankings[i - 1]!.position,
      )
    }

    // Check times are non-decreasing
    for (let i = 1; i < results.rankings.length; i++) {
      expect(results.rankings[i]!.time).toBeGreaterThanOrEqual(
        results.rankings[i - 1]!.time,
      )
    }
  })

  it('should be deterministic with same seed', () => {
    const simulation1 = new RaceSimulation(mockRound, 12345)
    const simulation2 = new RaceSimulation(mockRound, 12345)

    while (!simulation1.isComplete()) {
      simulation1.tick()
      simulation2.tick()
    }

    const results1 = simulation1.getResults()
    const results2 = simulation2.getResults()

    expect(results1.rankings).toEqual(results2.rankings)
  })


  it('should handle ties (same finish time) correctly', () => {
    // Create a scenario where horses are likely to finish at same time
    const tieRound: Round = {
      roundNumber: 1,
      distance: 100, // Very short race
      horses: [
        { horse: { id: 1, name: 'A', color: '#FF0000', condition: 85 }, lane: 3 },
        { horse: { id: 2, name: 'B', color: '#00FF00', condition: 85 }, lane: 5 },
        { horse: { id: 3, name: 'C', color: '#0000FF', condition: 85 }, lane: 7 },
      ],
    }

    // Use seed that creates a tie
    const simulation = new RaceSimulation(tieRound, 99999)

    while (!simulation.isComplete()) {
      simulation.tick()
    }

    const results = simulation.getResults()

    // Verify ranking structure is valid
    for (let i = 1; i < results.rankings.length; i++) {
      const current = results.rankings[i]!
      const previous = results.rankings[i - 1]!

      // If positions are equal, times must be very close (within 10ms)
      const isTie = current.position === previous.position
      const timeDiff = Math.abs(current.time - previous.time)

      // Positions equal => very close times
      // Different positions => current time >= previous time
      const validTie = isTie ? timeDiff < 0.01 : true
      const validOrder = !isTie ? current.time >= previous.time - 0.001 : true

      expect(validTie).toBe(true)
      expect(validOrder).toBe(true)
    }

    // All positions should be valid (1-3)
    results.rankings.forEach((ranking) => {
      expect(ranking.position).toBeGreaterThanOrEqual(1)
      expect(ranking.position).toBeLessThanOrEqual(3)
    })
  })
})

