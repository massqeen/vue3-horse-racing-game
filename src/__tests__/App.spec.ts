import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import App from '../App.vue'
import type { RootState } from '@/store'
import horses from '@/store/modules/horses'
import race from '@/store/modules/race'
import ui from '@/store/modules/ui'

describe('App', () => {
  it('renders game view with store', () => {
    // Create a test store
    const store = createStore<RootState>({
      modules: {
        horses,
        race,
        ui,
      },
    })

    const wrapper = mount(App, {
      global: {
        plugins: [store],
      },
    })

    // Check that the game title is rendered
    expect(wrapper.text()).toContain('Horse Racing Game')
  })

  it('renders control panel with buttons', () => {
    const store = createStore<RootState>({
      modules: {
        horses,
        race,
        ui,
      },
    })

    const wrapper = mount(App, {
      global: {
        plugins: [store],
      },
    })

    // Check that control buttons exist
    expect(wrapper.html()).toContain('Generate')
    expect(wrapper.html()).toContain('Start')
  })
})
