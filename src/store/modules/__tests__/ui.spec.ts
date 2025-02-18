import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'vuex'
import type { Store } from 'vuex'
import ui from '@/store/modules/ui'
import type { RootState } from '@/store'

describe('UI Store Module', () => {
  let store: Store<RootState>

  beforeEach(() => {
    // Create a fresh store instance for each test
    store = createStore({
      modules: {
        ui,
      },
    })
  })

  describe('initial state', () => {
    it('should start with idle phase', () => {
      expect(store.state.ui.phase).toBe('idle')
    })
  })

  describe('mutations', () => {
    it('SET_PHASE should update phase', () => {
      store.commit('ui/SET_PHASE', 'generated')
      expect(store.state.ui.phase).toBe('generated')

      store.commit('ui/SET_PHASE', 'running')
      expect(store.state.ui.phase).toBe('running')

      store.commit('ui/SET_PHASE', 'finished')
      expect(store.state.ui.phase).toBe('finished')
    })
  })

  describe('actions', () => {
    describe('setPhase', () => {
      it('should update phase to generated', async () => {
        await store.dispatch('ui/setPhase', 'generated')
        expect(store.state.ui.phase).toBe('generated')
      })

      it('should update phase to running', async () => {
        await store.dispatch('ui/setPhase', 'running')
        expect(store.state.ui.phase).toBe('running')
      })

      it('should update phase to finished', async () => {
        await store.dispatch('ui/setPhase', 'finished')
        expect(store.state.ui.phase).toBe('finished')
      })
    })

    describe('reset', () => {
      it('should reset phase to idle', async () => {
        // Set to different phase first
        store.commit('ui/SET_PHASE', 'finished')
        expect(store.state.ui.phase).toBe('finished')

        // Reset
        await store.dispatch('ui/reset')
        expect(store.state.ui.phase).toBe('idle')
      })
    })
  })

  describe('getters', () => {
    it('canGenerate should be true only in idle phase', () => {
      store.commit('ui/SET_PHASE', 'idle')
      expect(store.getters['ui/canGenerate']).toBe(true)

      store.commit('ui/SET_PHASE', 'generated')
      expect(store.getters['ui/canGenerate']).toBe(false)

      store.commit('ui/SET_PHASE', 'running')
      expect(store.getters['ui/canGenerate']).toBe(false)

      store.commit('ui/SET_PHASE', 'finished')
      expect(store.getters['ui/canGenerate']).toBe(false)
    })

    it('canStart should be true only in generated phase', () => {
      store.commit('ui/SET_PHASE', 'idle')
      expect(store.getters['ui/canStart']).toBe(false)

      store.commit('ui/SET_PHASE', 'generated')
      expect(store.getters['ui/canStart']).toBe(true)

      store.commit('ui/SET_PHASE', 'running')
      expect(store.getters['ui/canStart']).toBe(false)

      store.commit('ui/SET_PHASE', 'finished')
      expect(store.getters['ui/canStart']).toBe(false)
    })

    it('isRunning should be true only in running phase', () => {
      store.commit('ui/SET_PHASE', 'idle')
      expect(store.getters['ui/isRunning']).toBe(false)

      store.commit('ui/SET_PHASE', 'generated')
      expect(store.getters['ui/isRunning']).toBe(false)

      store.commit('ui/SET_PHASE', 'running')
      expect(store.getters['ui/isRunning']).toBe(true)

      store.commit('ui/SET_PHASE', 'finished')
      expect(store.getters['ui/isRunning']).toBe(false)
    })

    it('isFinished should be true only in finished phase', () => {
      store.commit('ui/SET_PHASE', 'idle')
      expect(store.getters['ui/isFinished']).toBe(false)

      store.commit('ui/SET_PHASE', 'generated')
      expect(store.getters['ui/isFinished']).toBe(false)

      store.commit('ui/SET_PHASE', 'running')
      expect(store.getters['ui/isFinished']).toBe(false)

      store.commit('ui/SET_PHASE', 'finished')
      expect(store.getters['ui/isFinished']).toBe(true)
    })
  })

  describe('phase transitions', () => {
    it('should support complete workflow: idle → generated → running → finished → idle', async () => {
      // Start: idle
      expect(store.state.ui.phase).toBe('idle')
      expect(store.getters['ui/canGenerate']).toBe(true)

      // Generate horses
      await store.dispatch('ui/setPhase', 'generated')
      expect(store.state.ui.phase).toBe('generated')
      expect(store.getters['ui/canStart']).toBe(true)

      // Start race
      await store.dispatch('ui/setPhase', 'running')
      expect(store.state.ui.phase).toBe('running')
      expect(store.getters['ui/isRunning']).toBe(true)

      // Finish race
      await store.dispatch('ui/setPhase', 'finished')
      expect(store.state.ui.phase).toBe('finished')
      expect(store.getters['ui/isFinished']).toBe(true)

      // Reset
      await store.dispatch('ui/reset')
      expect(store.state.ui.phase).toBe('idle')
      expect(store.getters['ui/canGenerate']).toBe(true)
    })
  })
})

