import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createStore } from 'vuex'
import type { Store } from 'vuex'
import horses from '@/store/modules/horses'
import type { RootState } from '@/store'
import * as generation from '@/domain/generation'

// Mock the generation module
vi.mock('@/domain/generation', () => ({
  generateHorses: vi.fn(),
}))

describe('Horses Store Module', () => {
  let store: Store<RootState>

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()

    // Create a fresh store instance for each test
    store = createStore({
      modules: {
        horses,
        ui: {
          namespaced: true,
          state: () => ({ phase: 'idle' as 'idle' | 'generated' | 'running' | 'finished' }),
          mutations: {
            SET_PHASE(state, phase: 'idle' | 'generated' | 'running' | 'finished') {
              state.phase = phase
            },
          },
        },
      },
    })
  })

  describe('initial state', () => {
    it('should have empty horses array', () => {
      expect(store.state.horses.horses).toEqual([])
    })

    it('should have seed set to 0', () => {
      expect(store.state.horses.seed).toBe(0)
    })
  })

  describe('mutations', () => {
    it('SET_HORSES should update horses array', () => {
      const mockHorses = [
        { id: 1, name: 'Thunder', color: '#FF6B6B', condition: 95 },
        { id: 2, name: 'Lightning', color: '#4ECDC4', condition: 88 },
      ]

      store.commit('horses/SET_HORSES', mockHorses)

      expect(store.state.horses.horses).toEqual(mockHorses)
      expect(store.state.horses.horses).toHaveLength(2)
    })

    it('SET_SEED should update seed value', () => {
      const testSeed = 1234567890

      store.commit('horses/SET_SEED', testSeed)

      expect(store.state.horses.seed).toBe(testSeed)
    })
  })

  describe('actions', () => {
    describe('generate', () => {
      it('should generate horses and set seed', async () => {
        const mockHorses = [
          { id: 1, name: 'Thunder', color: '#FF6B6B', condition: 95 },
          { id: 2, name: 'Lightning', color: '#4ECDC4', condition: 88 },
        ]

        vi.mocked(generation.generateHorses).mockReturnValue(mockHorses)

        await store.dispatch('horses/generate')

        expect(generation.generateHorses).toHaveBeenCalledOnce()
        expect(store.state.horses.horses).toEqual(mockHorses)
        expect(store.state.horses.seed).toBeGreaterThan(0)
      })

      it('should not generate horses when race is running', async () => {
        // Set phase to running
        store.commit('ui/SET_PHASE', 'running')

        await store.dispatch('horses/generate')

        expect(generation.generateHorses).not.toHaveBeenCalled()
        expect(store.state.horses.horses).toEqual([])
      })

      it('should use current timestamp as seed', async () => {
        const beforeTime = Date.now()

        vi.mocked(generation.generateHorses).mockReturnValue([])

        await store.dispatch('horses/generate')

        const afterTime = Date.now()
        const seed = store.state.horses.seed

        expect(seed).toBeGreaterThanOrEqual(beforeTime)
        expect(seed).toBeLessThanOrEqual(afterTime)
      })
    })

    describe('reset', () => {
      it('should clear horses and reset seed', async () => {
        // First populate with data
        store.commit('horses/SET_HORSES', [
          { id: 1, name: 'Thunder', color: '#FF6B6B', condition: 95 },
        ])
        store.commit('horses/SET_SEED', 123456)

        // Then reset
        await store.dispatch('horses/reset')

        expect(store.state.horses.horses).toEqual([])
        expect(store.state.horses.seed).toBe(0)
      })
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      const mockHorses = [
        { id: 1, name: 'Thunder', color: '#FF6B6B', condition: 95 },
        { id: 2, name: 'Lightning', color: '#4ECDC4', condition: 88 },
        { id: 3, name: 'Storm', color: '#45B7D1', condition: 92 },
      ]
      store.commit('horses/SET_HORSES', mockHorses)
    })

    it('all getter should return all horses', () => {
      const all = store.getters['horses/all']
      expect(all).toHaveLength(3)
      expect(all[0].name).toBe('Thunder')
    })

    it('byId getter should find horse by id', () => {
      const byId = store.getters['horses/byId']
      const horse = byId(2)

      expect(horse).toBeDefined()
      expect(horse?.name).toBe('Lightning')
      expect(horse?.condition).toBe(88)
    })

    it('byId getter should return undefined for non-existent id', () => {
      const byId = store.getters['horses/byId']
      const horse = byId(999)

      expect(horse).toBeUndefined()
    })
  })
})

