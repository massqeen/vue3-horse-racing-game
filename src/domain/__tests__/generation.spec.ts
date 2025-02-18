import { describe, it, expect } from 'vitest'
import { generateHorses, generateSchedule } from '@/domain/generation'
import { HORSES_TOTAL, ROUNDS_TOTAL, HORSES_PER_ROUND } from '@/domain/constants'

describe('Generation', () => {
  describe('generateHorses', () => {
    it('should generate correct number of horses', () => {
      const horses = generateHorses(12345)
      expect(horses).toHaveLength(HORSES_TOTAL)
    })

    it('should generate horses with unique IDs', () => {
      const horses = generateHorses(12345)
      const ids = horses.map((h) => h.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(HORSES_TOTAL)
    })

    it('should generate horses with valid conditions', () => {
      const horses = generateHorses(12345)
      horses.forEach((horse) => {
        expect(horse.condition).toBeGreaterThanOrEqual(80)
        expect(horse.condition).toBeLessThanOrEqual(100)
      })
    })

    it('should generate deterministic results with same seed', () => {
      const horses1 = generateHorses(12345)
      const horses2 = generateHorses(12345)
      expect(horses1).toEqual(horses2)
    })

    it('should generate different results with different seeds', () => {
      const horses1 = generateHorses(12345)
      const horses2 = generateHorses(54321)
      expect(horses1).not.toEqual(horses2)
    })

    it('should have unique colors', () => {
      const horses = generateHorses(12345)
      const colors = horses.map((h) => h.color)
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(HORSES_TOTAL)
    })
  })

  describe('generateSchedule', () => {
    it('should generate correct number of rounds', () => {
      const horses = generateHorses(12345)
      const schedule = generateSchedule(horses, 12345)
      expect(schedule).toHaveLength(ROUNDS_TOTAL)
    })

    it('should have correct number of horses per round', () => {
      const horses = generateHorses(12345)
      const schedule = generateSchedule(horses, 12345)
      schedule.forEach((round) => {
        expect(round.horses).toHaveLength(HORSES_PER_ROUND)
      })
    })

    it('should have correct distances', () => {
      const horses = generateHorses(12345)
      const schedule = generateSchedule(horses, 12345)
      const expectedDistances = [1200, 1400, 1600, 1800, 2000, 2200]
      schedule.forEach((round, index) => {
        expect(round.distance).toBe(expectedDistances[index])
        expect(round.roundNumber).toBe(index + 1)
      })
    })

    it('should generate deterministic schedule with same seed', () => {
      const horses = generateHorses(12345)
      const schedule1 = generateSchedule(horses, 12345)
      const schedule2 = generateSchedule(horses, 12345)
      expect(schedule1).toEqual(schedule2)
    })

    it('should only include horses from provided list', () => {
      const horses = generateHorses(12345)
      const schedule = generateSchedule(horses, 12345)
      const horseIds = new Set(horses.map((h) => h.id))

      schedule.forEach((round) => {
        round.horses.forEach((horseInLane) => {
          expect(horseIds.has(horseInLane.horse.id)).toBe(true)
        })
      })
    })

    it('should assign lanes with strongest horses in middle (swimming-style)', () => {
      const horses = generateHorses(12345)
      const schedule = generateSchedule(horses, 12345)

      schedule.forEach((round) => {
        // Sort horses by condition to find strongest
        const sortedByCondition = [...round.horses].sort(
          (a, b) => b.horse.condition - a.horse.condition,
        )

        // Strongest horse should be in lane 5 or 6 (middle lanes)
        const strongestLane = sortedByCondition[0]!.lane
        expect([5, 6]).toContain(strongestLane)

        // Each horse should have a lane between 1 and 10
        round.horses.forEach((horseInLane) => {
          expect(horseInLane.lane).toBeGreaterThanOrEqual(1)
          expect(horseInLane.lane).toBeLessThanOrEqual(10)
        })

        // All lanes should be unique
        const lanes = round.horses.map((h) => h.lane)
        const uniqueLanes = new Set(lanes)
        expect(uniqueLanes.size).toBe(10)
      })
    })
  })
})

