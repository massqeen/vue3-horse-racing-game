import type { Module } from 'vuex'
import type { RootState } from '@/store'
import type { Horse } from '@/domain/types'
import { generateHorses } from '@/domain/generation'

export interface HorsesState {
  horses: Horse[]
  seed: number
}

const horses: Module<HorsesState, RootState> = {
  namespaced: true,

  state: (): HorsesState => ({
    horses: [],
    seed: 0,
  }),

  mutations: {
    SET_HORSES(state, horses: Horse[]) {
      state.horses = horses
    },
    SET_SEED(state, seed: number) {
      state.seed = seed
    },
  },

  actions: {
    generate({ commit, rootState }) {
      // Guard: prevent generating horses during race
      if (rootState.ui.phase === 'running') {
        console.warn('[Horses] Cannot generate horses - race is running')
        return
      }

      const seed = Date.now()
      const horses = generateHorses(seed)
      commit('SET_SEED', seed)
      commit('SET_HORSES', horses)
    },
    reset({ commit }) {
      commit('SET_HORSES', [])
      commit('SET_SEED', 0)
    },
  },

  getters: {
    all: (state) => state.horses,
    byId: (state) => (id: number) => state.horses.find((h) => h.id === id),
  },
}

export default horses
