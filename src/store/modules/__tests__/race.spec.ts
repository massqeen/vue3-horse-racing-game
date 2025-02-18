import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { createStore } from 'vuex'
import type { Store } from 'vuex'
import race from '@/store/modules/race'
import type { RootState } from '@/store'
import * as generation from '@/domain/generation'
import { simulationService } from '@/services/simulationService'
import type { Round, RoundResult, HorseProgress, Horse } from '@/domain/types'

// Mock the generation module
vi.mock('@/domain/generation', () => ({
  generateSchedule: vi.fn(),
}))

// Mock the simulation service
vi.mock('@/services/simulationService', () => ({
  simulationService: {
    initialize: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    cleanup: vi.fn(),
    isRunning: vi.fn(() => false),
    getProgress: vi.fn(() => null),
    isComplete: vi.fn(() => false),
    getResults: vi.fn(() => null),
    hasSimulation: vi.fn(() => false),
  },
}))

describe('Race Store Module', () => {
  let store: Store<RootState>

  // Mock data
  const mockHorses: Horse[] = [
    { id: 1, name: 'Thunder', color: '#FF6B6B', condition: 95 },
    { id: 2, name: 'Lightning', color: '#4ECDC4', condition: 88 },
    { id: 3, name: 'Storm', color: '#45B7D1', condition: 92 },
  ]

  const mockRound: Round = {
    roundNumber: 1,
    distance: 1200,
    horses: [
      { horse: mockHorses[0]!, lane: 5 },
      { horse: mockHorses[1]!, lane: 6 },
      { horse: mockHorses[2]!, lane: 4 },
    ],
  }

  const mockSchedule: Round[] = [mockRound]

  const mockProgress: HorseProgress[] = [
    { horseId: 1, lane: 5, position: 25, speed: 15, finishPosition: undefined },
    { horseId: 2, lane: 6, position: 20.83, speed: 14.5, finishPosition: undefined },
    { horseId: 3, lane: 4, position: 23.33, speed: 14.8, finishPosition: undefined },
  ]

  const mockResult: RoundResult = {
    roundNumber: 1,
    distance: 1200,
    rankings: [
      { position: 1, horse: mockHorses[0]!, lane: 5, time: 80.5 },
      { position: 2, horse: mockHorses[2]!, lane: 4, time: 81.2 },
      { position: 3, horse: mockHorses[1]!, lane: 6, time: 82.1 },
    ],
  }

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()

    // Create a fresh store instance for each test
    store = createStore({
      modules: {
        race,
        horses: {
          namespaced: true,
          state: () => ({
            horses: mockHorses,
            seed: 123456,
          }),
        },
        ui: {
          namespaced: true,
          state: () => ({ phase: 'idle' as 'idle' | 'generated' | 'running' | 'finished' }),
          mutations: {
            SET_PHASE(state, phase: 'idle' | 'generated' | 'running' | 'finished') {
              state.phase = phase
            },
          },
          actions: {
            setPhase({ commit }, phase: 'idle' | 'generated' | 'running' | 'finished') {
              commit('SET_PHASE', phase)
            },
          },
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have empty schedule', () => {
      expect(store.state.race.schedule).toEqual([])
    })

    it('should have currentRoundIndex set to -1', () => {
      expect(store.state.race.currentRoundIndex).toBe(-1)
    })

    it('should have empty results', () => {
      expect(store.state.race.results).toEqual([])
    })

    it('should have empty currentProgress', () => {
      expect(store.state.race.currentProgress).toEqual([])
    })

    it('should have isSimulationRunning set to false', () => {
      expect(store.state.race.isSimulationRunning).toBe(false)
    })
  })

  describe('mutations', () => {
    it('SET_SCHEDULE should update schedule', () => {
      store.commit('race/SET_SCHEDULE', mockSchedule)
      expect(store.state.race.schedule).toEqual(mockSchedule)
    })

    it('SET_CURRENT_ROUND_INDEX should update currentRoundIndex', () => {
      store.commit('race/SET_CURRENT_ROUND_INDEX', 2)
      expect(store.state.race.currentRoundIndex).toBe(2)
    })

    it('ADD_RESULT should append result to results array', () => {
      store.commit('race/ADD_RESULT', mockResult)
      expect(store.state.race.results).toHaveLength(1)
      expect(store.state.race.results[0]).toEqual(mockResult)

      // Add another result
      const secondResult = { ...mockResult, roundNumber: 2 }
      store.commit('race/ADD_RESULT', secondResult)
      expect(store.state.race.results).toHaveLength(2)
    })

    it('CLEAR_RESULTS should empty results array', () => {
      store.commit('race/ADD_RESULT', mockResult)
      expect(store.state.race.results).toHaveLength(1)

      store.commit('race/CLEAR_RESULTS')
      expect(store.state.race.results).toEqual([])
    })

    it('SET_CURRENT_PROGRESS should update currentProgress', () => {
      store.commit('race/SET_CURRENT_PROGRESS', mockProgress)
      expect(store.state.race.currentProgress).toEqual(mockProgress)
    })

    it('SET_SIMULATION_RUNNING should update isSimulationRunning flag', () => {
      store.commit('race/SET_SIMULATION_RUNNING', true)
      expect(store.state.race.isSimulationRunning).toBe(true)

      store.commit('race/SET_SIMULATION_RUNNING', false)
      expect(store.state.race.isSimulationRunning).toBe(false)
    })

    it('RESET should reset all state to initial values', () => {
      // Populate state
      store.commit('race/SET_SCHEDULE', mockSchedule)
      store.commit('race/SET_CURRENT_ROUND_INDEX', 3)
      store.commit('race/ADD_RESULT', mockResult)
      store.commit('race/SET_CURRENT_PROGRESS', mockProgress)
      store.commit('race/SET_SIMULATION_RUNNING', true)

      // Reset
      store.commit('race/RESET')

      expect(store.state.race.schedule).toEqual([])
      expect(store.state.race.currentRoundIndex).toBe(-1)
      expect(store.state.race.results).toEqual([])
      expect(store.state.race.currentProgress).toEqual([])
      expect(store.state.race.isSimulationRunning).toBe(false)
    })
  })

  describe('actions', () => {
    describe('generateSchedule', () => {
      it('should generate schedule from horses and seed', async () => {
        vi.mocked(generation.generateSchedule).mockReturnValue(mockSchedule)

        await store.dispatch('race/generateSchedule')

        expect(generation.generateSchedule).toHaveBeenCalledWith(mockHorses, expect.any(Number))
        expect(store.state.race.schedule).toEqual(mockSchedule)
        expect(store.state.race.currentRoundIndex).toBe(-1)
        expect(store.state.race.results).toEqual([])
      })

      it('should not generate schedule when race is running', async () => {
        store.commit('ui/SET_PHASE', 'running')

        await store.dispatch('race/generateSchedule')

        expect(generation.generateSchedule).not.toHaveBeenCalled()
        expect(store.state.race.schedule).toEqual([])
      })

      it('should cleanup simulation service before generating', async () => {
        vi.mocked(generation.generateSchedule).mockReturnValue(mockSchedule)

        await store.dispatch('race/generateSchedule')

        expect(simulationService.cleanup).toHaveBeenCalledOnce()
      })

      it('should clear previous results when generating new schedule', async () => {
        // Add existing results
        store.commit('race/ADD_RESULT', mockResult)
        expect(store.state.race.results).toHaveLength(1)

        vi.mocked(generation.generateSchedule).mockReturnValue(mockSchedule)

        await store.dispatch('race/generateSchedule')

        expect(store.state.race.results).toEqual([])
      })
    })

    describe('startRaces', () => {
      beforeEach(() => {
        // Setup: generate schedule first
        vi.mocked(generation.generateSchedule).mockReturnValue(mockSchedule)
        store.dispatch('race/generateSchedule')
        store.commit('ui/SET_PHASE', 'generated')
      })

      it('should call startNextRound which increments round index', async () => {
        expect(store.state.race.currentRoundIndex).toBe(-1)

        await store.dispatch('race/startRaces')

        // startNextRound should have been called, incrementing the index
        expect(store.state.race.currentRoundIndex).toBe(0)
        expect(store.state.ui.phase).toBe('running')
      })

      it('should not start when already running', async () => {
        store.commit('ui/SET_PHASE', 'running')

        const startNextRoundSpy = vi.spyOn(store, 'dispatch')

        await store.dispatch('race/startRaces')

        // Should not call startNextRound
        expect(startNextRoundSpy).not.toHaveBeenCalledWith('race/startNextRound', undefined, undefined)
      })

      it('should not start when no schedule generated', async () => {
        store.commit('ui/SET_PHASE', 'idle')

        const startNextRoundSpy = vi.spyOn(store, 'dispatch')

        await store.dispatch('race/startRaces')

        expect(startNextRoundSpy).not.toHaveBeenCalledWith('race/startNextRound', undefined, undefined)
      })

      it('should not start when all rounds already completed', async () => {
        // Mark all rounds as completed
        store.commit('race/SET_CURRENT_ROUND_INDEX', 0)
        store.commit('race/ADD_RESULT', mockResult)

        const startNextRoundSpy = vi.spyOn(store, 'dispatch')

        await store.dispatch('race/startRaces')

        expect(startNextRoundSpy).not.toHaveBeenCalledWith('race/startNextRound', undefined, undefined)
      })
    })

    describe('startNextRound', () => {
      beforeEach(() => {
        // Setup: generate schedule with multiple rounds
        const multiRoundSchedule = [
          mockRound,
          { ...mockRound, roundNumber: 2, distance: 1400 },
        ]
        vi.mocked(generation.generateSchedule).mockReturnValue(multiRoundSchedule)
        store.dispatch('race/generateSchedule')
        store.commit('ui/SET_PHASE', 'generated')
        vi.mocked(simulationService.getProgress).mockReturnValue(mockProgress)
        // Reset isRunning to false for each test
        vi.mocked(simulationService.isRunning).mockReturnValue(false)
      })

      it('should increment currentRoundIndex', async () => {
        expect(store.state.race.currentRoundIndex).toBe(-1)

        await store.dispatch('race/startNextRound')

        expect(store.state.race.currentRoundIndex).toBe(0)
      })

      it('should initialize simulation service', async () => {
        await store.dispatch('race/startNextRound')

        expect(simulationService.initialize).toHaveBeenCalledWith(
          expect.objectContaining({ roundNumber: 1 }),
          expect.any(Number)
        )
      })

      it('should set phase to running', async () => {
        await store.dispatch('race/startNextRound')

        expect(store.state.ui.phase).toBe('running')
      })

      it('should start simulation service', async () => {
        await store.dispatch('race/startNextRound')

        expect(simulationService.start).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Function),
          expect.any(Function)
        )
      })

      it('should set initial progress', async () => {
        await store.dispatch('race/startNextRound')

        expect(store.state.race.currentProgress).toEqual(mockProgress)
      })

      it('should set simulation running flag', async () => {
        await store.dispatch('race/startNextRound')

        expect(store.state.race.isSimulationRunning).toBe(true)
      })

      it('should not start if simulation already running', async () => {
        vi.mocked(simulationService.isRunning).mockReturnValue(true)

        await store.dispatch('race/startNextRound')

        expect(simulationService.initialize).not.toHaveBeenCalled()
      })

      it('should set phase to finished when all rounds complete', async () => {
        // Set to last round index (1, since we have 2 rounds with indices 0 and 1)
        store.commit('race/SET_CURRENT_ROUND_INDEX', 1)
        store.commit('ui/SET_PHASE', 'generated')

        // Try to start next round - should set phase to finished since no more rounds
        await store.dispatch('race/startNextRound')

        expect(store.state.ui.phase).toBe('finished')
      })

      it('should pass onTick callback to simulation service', async () => {
        await store.dispatch('race/startNextRound')

        // Verify that start was called with a tick callback
        const startCall = vi.mocked(simulationService.start).mock.calls[0]
        expect(startCall).toBeDefined()
        expect(startCall?.[1]).toBeTypeOf('function')
      })

      it('should pass onComplete callback to simulation service', async () => {
        await store.dispatch('race/startNextRound')

        // Verify that start was called with a complete callback
        const startCall = vi.mocked(simulationService.start).mock.calls[0]
        expect(startCall).toBeDefined()
        expect(startCall?.[2]).toBeTypeOf('function')
      })
    })

    describe('reset', () => {
      it('should cleanup simulation service', async () => {
        await store.dispatch('race/reset')

        expect(simulationService.cleanup).toHaveBeenCalledOnce()
      })

      it('should reset state to initial values', async () => {
        // Populate state
        store.commit('race/SET_SCHEDULE', mockSchedule)
        store.commit('race/SET_CURRENT_ROUND_INDEX', 2)
        store.commit('race/ADD_RESULT', mockResult)
        store.commit('race/SET_CURRENT_PROGRESS', mockProgress)
        store.commit('race/SET_SIMULATION_RUNNING', true)

        await store.dispatch('race/reset')

        expect(store.state.race.schedule).toEqual([])
        expect(store.state.race.currentRoundIndex).toBe(-1)
        expect(store.state.race.results).toEqual([])
        expect(store.state.race.currentProgress).toEqual([])
        expect(store.state.race.isSimulationRunning).toBe(false)
      })
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      // Setup: generate schedule
      vi.mocked(generation.generateSchedule).mockReturnValue(mockSchedule)
      store.dispatch('race/generateSchedule')
    })

    it('currentRound should return null when no round started', () => {
      expect(store.getters['race/currentRound']).toBeNull()
    })

    it('currentRound should return current round when race started', () => {
      store.commit('race/SET_CURRENT_ROUND_INDEX', 0)

      const currentRound = store.getters['race/currentRound']
      expect(currentRound).toEqual(mockRound)
    })

    it('isRacing should reflect simulation running state', () => {
      expect(store.getters['race/isRacing']).toBe(false)

      store.commit('race/SET_SIMULATION_RUNNING', true)
      expect(store.getters['race/isRacing']).toBe(true)

      store.commit('race/SET_SIMULATION_RUNNING', false)
      expect(store.getters['race/isRacing']).toBe(false)
    })

    it('hasSchedule should return false when no schedule', () => {
      store.commit('race/SET_SCHEDULE', [])
      expect(store.getters['race/hasSchedule']).toBe(false)
    })

    it('hasSchedule should return true when schedule exists', () => {
      expect(store.getters['race/hasSchedule']).toBe(true)
    })
  })
})

