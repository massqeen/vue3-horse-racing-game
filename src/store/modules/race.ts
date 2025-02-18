import type { Module } from 'vuex'
import type { RootState } from '@/store'
import type { Round, RoundResult, HorseProgress } from '@/domain/types'
import { generateSchedule } from '@/domain/generation'
import { RaceSimulation } from '@/domain/simulation'
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
  simulation: RaceSimulation | null
  intervalId: number | null
}

const race: Module<RaceState, RootState> = {
  namespaced: true,

  state: (): RaceState => ({
    schedule: [],
    currentRoundIndex: -1,
    results: [],
    currentProgress: [],
    simulation: null,
    intervalId: null,
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
    SET_SIMULATION(state, simulation: RaceSimulation | null) {
      state.simulation = simulation
    },
    SET_INTERVAL_ID(state, id: number | null) {
      state.intervalId = id
    },
    TICK_SIMULATION(state) {
      if (state.simulation) {
        state.simulation.tick()
      }
    },
    RESET(state) {
      state.schedule = []
      state.currentRoundIndex = -1
      state.results = []
      state.currentProgress = []
      state.simulation = null
      if (state.intervalId) {
        clearInterval(state.intervalId)
        state.intervalId = null
      }
    },
  },

  actions: {
    generateSchedule({ commit, rootState, state }) {
      // Guard: prevent generating schedule during race
      if (rootState.ui.phase === 'running') {
        console.warn('[Race] Cannot generate schedule - race is running')
        return
      }

      // Guard: stop any running simulation before generating new schedule
      if (state.intervalId) {
        clearInterval(state.intervalId)
        commit('SET_INTERVAL_ID', null)
        commit('SET_SIMULATION', null)
      }

      const horses = rootState.horses.horses
      const seed = rootState.horses.seed
      const schedule = generateSchedule(horses, seed + SCHEDULE_SEED_OFFSET) // Use different seed for schedule
      commit('SET_SCHEDULE', schedule)
      commit('SET_CURRENT_ROUND_INDEX', -1)
      commit('CLEAR_RESULTS')
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
      if (state.intervalId !== null) {
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
      const simulation = new RaceSimulation(round, seed)

      commit('SET_SIMULATION', simulation)
      commit('SET_CURRENT_PROGRESS', simulation.getProgress())

      // Start simulation loop
      const intervalId = setInterval(() => {
        if (!state.simulation) return

        commit('TICK_SIMULATION')
        commit('SET_CURRENT_PROGRESS', state.simulation.getProgress())

        if (state.simulation.isComplete()) {
          const result = state.simulation.getResults()
          commit('ADD_RESULT', result)
          commit('SET_SIMULATION', null)

          if (state.intervalId) {
            clearInterval(state.intervalId)
            commit('SET_INTERVAL_ID', null)
          }

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
      }, SIMULATION_TICK_MS)

      commit('SET_INTERVAL_ID', intervalId as unknown as number)
    },

    reset({ commit }) {
      commit('RESET')
    },
  },

  getters: {
    currentRound: (state) =>
      state.currentRoundIndex >= 0 ? state.schedule[state.currentRoundIndex] : null,
    isRacing: (state) => state.simulation !== null,
    hasSchedule: (state) => state.schedule.length > 0,
  },
}

export default race
