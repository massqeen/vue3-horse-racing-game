import { ref, type Ref } from 'vue'

/**
 * Composable for managing hovered horse state across components
 *
 * This is transient UI state that doesn't need to be in Vuex.
 * Using a shared ref allows components to reactively share hover state
 * without the overhead of Vuex mutations/actions.
 */

// Shared reactive state (singleton pattern for cross-component communication)
const hoveredHorseId: Ref<number | null> = ref(null)

export function useHoveredHorse() {
  /**
   * Set the currently hovered horse ID
   */
  function setHoveredHorse(horseId: number | null): void {
    hoveredHorseId.value = horseId
  }

  /**
   * Check if a specific horse is hovered
   */
  function isHorseHovered(horseId: number): boolean {
    return hoveredHorseId.value === horseId
  }

  /**
   * Clear hover state
   */
  function clearHover(): void {
    hoveredHorseId.value = null
  }

  return {
    hoveredHorseId,
    setHoveredHorse,
    isHorseHovered,
    clearHover,
  }
}

