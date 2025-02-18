import type { Module } from 'vuex'
import type { RootState } from '@/store'
import type { Round, RoundResult, HorseProgress } from '@/domain/types'
import { generateSchedule } from '@/domain/generation'
import { simulationService } from '@/services/simulationService'
import {
  SIMULATION_TICK_MS,
  SCHEDULE_SEED_OFFSET,
  ROUND_SEED_OFFSET,
} from '@/domain/constants'

export interface RaceState {
  schedule: Round[]
  currentRoundIndex: number
  results: RoundResult[]
  currentProgress: HorseProgress[]
  isSimulationRunning: boolean
}

const race: Module<RaceState, RootState> = {
  namespaced: true,

  state: (): RaceState => ({
    schedule: [],
    currentRoundIndex: -1,
    results: [],
    currentProgress: [],
    isSimulationRunning: false,
  }),

  mutations: {
    SET_SCHEDULE(state, schedule: Round[]) {
      state.schedule = schedule
    },
    SET_CURRENT_ROUND_INDEX(state, index: number) {
      state.currentRoundIndex = index
    },
    ADD_RESULT(state, result: RoundResult) {
      state.results.push(result)
    },
    CLEAR_RESULTS(state) {
      state.results = []
    },
    SET_CURRENT_PROGRESS(state, progress: HorseProgress[]) {
      state.currentProgress = progress
    },
    SET_SIMULATION_RUNNING(state, isRunning: boolean) {
      state.isSimulationRunning = isRunning
    },
    RESET(state) {
      state.schedule = []
      state.currentRoundIndex = -1
      state.results = []
      state.currentProgress = []
      state.isSimulationRunning = false
    },
  },

  actions: {
    generateSchedule({ commit, rootState }) {
      // Guard: prevent generating schedule during race
      if (rootState.ui.phase === 'running') {
        console.warn('[Race] Cannot generate schedule - race is running')
        return
      }

      // Guard: stop any running simulation before generating new schedule
      simulationService.cleanup()

      const horses = rootState.horses.horses
      const seed = rootState.horses.seed
      const schedule = generateSchedule(horses, seed + SCHEDULE_SEED_OFFSET) // Use different seed for schedule
      commit('SET_SCHEDULE', schedule)
      commit('SET_CURRENT_ROUND_INDEX', -1)
      commit('CLEAR_RESULTS')
      commit('SET_SIMULATION_RUNNING', false)
    },

    startRaces({ dispatch, rootState, state }) {
      // Guard: prevent starting if race is already running
      if (rootState.ui.phase === 'running') {
        console.warn('[Race] Cannot start race - already running')
        return
      }

      // Guard: prevent starting if no schedule generated
      if (rootState.ui.phase !== 'generated') {
        console.warn('[Race] Cannot start race - no schedule generated')
        return
      }

      // Guard: prevent starting if all rounds already completed
      if (state.currentRoundIndex >= state.schedule.length - 1 && state.results.length === state.schedule.length) {
        console.warn('[Race] Cannot start race - all rounds already completed')
        return
      }

      dispatch('startNextRound')
    },

    startNextRound({ state, commit, dispatch, rootState }) {
      // Guard: prevent starting next round if already running
      if (simulationService.isRunning()) {
        console.warn('[Race] Cannot start next round - simulation already running')
        return
      }

      const nextIndex = state.currentRoundIndex + 1

      if (nextIndex >= state.schedule.length) {
        // All rounds completed
        dispatch('ui/setPhase', 'finished', { root: true })
        return
      }

      commit('SET_CURRENT_ROUND_INDEX', nextIndex)
      dispatch('ui/setPhase', 'running', { root: true })

      const round = state.schedule[nextIndex]
      if (!round) {
        return
      }

      const seed = rootState.horses.seed + nextIndex + ROUND_SEED_OFFSET // Unique seed per round

      // Initialize simulation in service (outside Vuex)
      simulationService.initialize(round, seed)

      const initialProgress = simulationService.getProgress()
      if (initialProgress) {
        commit('SET_CURRENT_PROGRESS', initialProgress)
      }
      commit('SET_SIMULATION_RUNNING', true)

      // Start simulation loop with callbacks
      simulationService.start(
        SIMULATION_TICK_MS,
        // onTick callback
        (progress: HorseProgress[]) => {
          commit('SET_CURRENT_PROGRESS', progress)
        },
        // onComplete callback
        (result: RoundResult) => {
          commit('ADD_RESULT', result)
          commit('SET_SIMULATION_RUNNING', false)

          // Check if all rounds are complete
          const nextIndex = state.currentRoundIndex + 1

          if (nextIndex >= state.schedule.length) {
            // All rounds completed
            dispatch('ui/setPhase', 'finished', { root: true })
          } else {
            // More rounds to go - return to generated phase so user can start next round manually
            dispatch('ui/setPhase', 'generated', { root: true })
          }
        }
      )
    },

    reset({ commit }) {
      simulationService.cleanup()
      commit('RESET')
    },
  },

  getters: {
    currentRound: (state) =>
      state.currentRoundIndex >= 0 ? state.schedule[state.currentRoundIndex] : null,
    isRacing: (state) => state.isSimulationRunning,
    hasSchedule: (state) => state.schedule.length > 0,
  },
}

export default race
