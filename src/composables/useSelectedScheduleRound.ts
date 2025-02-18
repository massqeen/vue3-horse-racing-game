import { ref, type Ref } from 'vue'

/**
 * Composable for managing selected schedule round tab
 *
 * This is transient UI state for tab selection that doesn't need to be in Vuex.
 * Using a shared ref allows components to reactively access the selected round
 * without the overhead of Vuex mutations/actions.
 */

// Shared reactive state (singleton pattern for cross-component communication)
const selectedScheduleRound: Ref<number | null> = ref(null)

export function useSelectedScheduleRound() {
  /**
   * Set the currently selected schedule round
   */
  function setSelectedRound(roundNumber: number | null): void {
    selectedScheduleRound.value = roundNumber
  }

  /**
   * Check if a specific round is selected
   */
  function isRoundSelected(roundNumber: number): boolean {
    return selectedScheduleRound.value === roundNumber
  }

  /**
   * Clear selected round
   */
  function clearSelection(): void {
    selectedScheduleRound.value = null
  }

  return {
    selectedScheduleRound,
    setSelectedRound,
    isRoundSelected,
    clearSelection,
  }
}

