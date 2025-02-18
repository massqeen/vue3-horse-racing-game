import type { Module } from 'vuex'
import type { RootState } from '@/store'

export type AppPhase = 'idle' | 'generated' | 'running' | 'finished'

export interface UiState {
  phase: AppPhase
}

const ui: Module<UiState, RootState> = {
  namespaced: true,

  state: (): UiState => ({
    phase: 'idle',
  }),

  mutations: {
    SET_PHASE(state, phase: AppPhase) {
      state.phase = phase
    },
  },

  actions: {
    setPhase({ commit }, phase: AppPhase) {
      commit('SET_PHASE', phase)
    },
    reset({ commit }) {
      commit('SET_PHASE', 'idle')
    },
  },

  getters: {
    canGenerate: (state) => state.phase === 'idle',
    canStart: (state) => state.phase === 'generated',
    isRunning: (state) => state.phase === 'running',
    isFinished: (state) => state.phase === 'finished',
  },
}

export default ui
