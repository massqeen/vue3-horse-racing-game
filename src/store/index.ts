import { createStore } from 'vuex'
import horses, { type HorsesState } from './modules/horses'
import race, { type RaceState } from './modules/race'
import ui, { type UiState } from './modules/ui'

export interface RootState {
  horses: HorsesState
  race: RaceState
  ui: UiState
}

const store = createStore<RootState>({
  modules: {
    horses,
    race,
    ui,
  },
  strict: import.meta.env.DEV,
})

export default store
