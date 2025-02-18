import type { Module } from 'vuex'
import type { RootState } from '@/store'

export type AppPhase = 'idle' | 'generated' | 'running' | 'finished'

export interface UiState {
  phase: AppPhase
  selectedScheduleRound: number | null // Which round is selected in schedule tabs
  hoveredHorseId: number | null // Which horse is being hovered in horse list
}

const ui: Module<UiState, RootState> = {
  namespaced: true,

  state: (): UiState => ({
    phase: 'idle',
    selectedScheduleRound: null,
    hoveredHorseId: null,
  }),

  mutations: {
    SET_PHASE(state, phase: AppPhase) {
      state.phase = phase
    },
    SET_SELECTED_SCHEDULE_ROUND(state, roundNumber: number | null) {
      state.selectedScheduleRound = roundNumber
    },
    SET_HOVERED_HORSE_ID(state, horseId: number | null) {
      state.hoveredHorseId = horseId
    },
  },

  actions: {
    setPhase({ commit }, phase: AppPhase) {
      commit('SET_PHASE', phase)
    },
    setSelectedScheduleRound({ commit }, roundNumber: number | null) {
      commit('SET_SELECTED_SCHEDULE_ROUND', roundNumber)
    },
    setHoveredHorseId({ commit }, horseId: number | null) {
      commit('SET_HOVERED_HORSE_ID', horseId)
    },
    reset({ commit }) {
      commit('SET_PHASE', 'idle')
      commit('SET_SELECTED_SCHEDULE_ROUND', null)
      commit('SET_HOVERED_HORSE_ID', null)
    },
  },

  getters: {
    canGenerate: (state) => state.phase === 'idle' || state.phase === 'finished',
    canStart: (state) => state.phase === 'generated',
    isRunning: (state) => state.phase === 'running',
    isFinished: (state) => state.phase === 'finished',
  },
}

export default ui
