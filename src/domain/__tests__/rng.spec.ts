import { describe, it, expect } from 'vitest'
import { createSeededRandom, randomInt, shuffleArray } from '@/domain/rng'

describe('RNG', () => {
  describe('createSeededRandom', () => {
    it('should generate deterministic random numbers', () => {
      const random1 = createSeededRandom(12345)
      const random2 = createSeededRandom(12345)

      const sequence1 = [random1(), random1(), random1()]
      const sequence2 = [random2(), random2(), random2()]

      expect(sequence1).toEqual(sequence2)
    })

    it('should generate different sequences for different seeds', () => {
      const random1 = createSeededRandom(12345)
      const random2 = createSeededRandom(54321)

      const val1 = random1()
      const val2 = random2()

      expect(val1).not.toEqual(val2)
    })

    it('should generate numbers between 0 and 1', () => {
      const random = createSeededRandom(12345)

      for (let i = 0; i < 100; i++) {
        const value = random()
        expect(value).toBeGreaterThanOrEqual(0)
        expect(value).toBeLessThan(1)
      }
    })
  })

  describe('randomInt', () => {
    it('should generate integers within range', () => {
      const random = createSeededRandom(12345)

      for (let i = 0; i < 100; i++) {
        const value = randomInt(random, 1, 100)
        expect(value).toBeGreaterThanOrEqual(1)
        expect(value).toBeLessThanOrEqual(100)
        expect(Number.isInteger(value)).toBe(true)
      }
    })

    it('should generate deterministic sequence', () => {
      const random1 = createSeededRandom(12345)
      const random2 = createSeededRandom(12345)

      const sequence1 = [
        randomInt(random1, 1, 100),
        randomInt(random1, 1, 100),
        randomInt(random1, 1, 100),
      ]
      const sequence2 = [
        randomInt(random2, 1, 100),
        randomInt(random2, 1, 100),
        randomInt(random2, 1, 100),
      ]

      expect(sequence1).toEqual(sequence2)
    })
  })

  describe('shuffleArray', () => {
    it('should shuffle array deterministically', () => {
      const random1 = createSeededRandom(12345)
      const random2 = createSeededRandom(12345)

      const array1 = [1, 2, 3, 4, 5]
      const array2 = [1, 2, 3, 4, 5]

      const shuffled1 = shuffleArray(random1, array1)
      const shuffled2 = shuffleArray(random2, array2)

      expect(shuffled1).toEqual(shuffled2)
    })

    it('should not modify original array', () => {
      const random = createSeededRandom(12345)
      const original = [1, 2, 3, 4, 5]
      const copy = [...original]

      shuffleArray(random, original)

      expect(original).toEqual(copy)
    })

    it('should contain same elements', () => {
      const random = createSeededRandom(12345)
      const original = [1, 2, 3, 4, 5]

      const shuffled = shuffleArray(random, original)

      expect(shuffled.sort()).toEqual(original.sort())
    })
  })
})

