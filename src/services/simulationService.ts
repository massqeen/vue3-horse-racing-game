import { RaceSimulation } from '@/domain/simulation'
import type { Round, HorseProgress, RoundResult } from '@/domain/types'

/**
 * Simulation Manager Service
 *
 * This service manages the RaceSimulation instance outside of Vuex state.
 * Vuex only stores serializable data (plain objects), while this service
 * holds the non-serializable class instance with Maps/Sets.
 *
 * This separation ensures Vuex devtools time-travel debugging works correctly.
 *
 * Uses requestAnimationFrame for smooth visual updates synchronized with
 * the browser's paint cycle, providing better performance than setInterval.
 *
 * For test acceleration (200x speed), processes multiple simulation ticks per
 * animation frame, since RAF is limited to ~60 FPS but tests need millisecond ticks.
 */
class SimulationService {
  private simulation: RaceSimulation | null = null
  private rafId: number | null = null
  private lastTickTime: number = 0
  private tickInterval: number = 0

  /**
   * Initialize a new simulation for a round
   */
  initialize(round: Round, seed: number): void {
    this.cleanup()
    this.simulation = new RaceSimulation(round, seed)
  }

  /**
   * Start the simulation loop with a callback
   * Uses requestAnimationFrame for smooth updates synchronized with browser refresh rate
   */
  start(tickMs: number, onTick: (progress: HorseProgress[], isComplete: boolean) => void, onComplete: (result: RoundResult) => void): void {
    if (!this.simulation) {
      console.error('[SimulationService] Cannot start - no simulation initialized')
      return
    }

    if (this.rafId !== null) {
      console.warn('[SimulationService] Simulation already running')
      return
    }

    this.tickInterval = tickMs
    this.lastTickTime = performance.now()

    // Animation loop using requestAnimationFrame
    const animate = (currentTime: number) => {
      if (!this.simulation) return

      // Calculate elapsed time since last tick
      const elapsed = currentTime - this.lastTickTime

      // Process multiple ticks if needed (for test mode with high acceleration)
      // This allows 200x speed even though RAF is limited to ~60 FPS
      if (elapsed >= this.tickInterval) {
        // Calculate how many ticks should have occurred
        const ticksToProcess = Math.floor(elapsed / this.tickInterval)

        // Process all accumulated ticks (max 100 per frame to prevent freezing)
        const ticksThisFrame = Math.min(ticksToProcess, 100)

        for (let i = 0; i < ticksThisFrame; i++) {
          this.simulation.tick()

          // Check completion after each tick
          if (this.simulation.isComplete()) {
            const progress = this.simulation.getProgress()
            const result = this.simulation.getResults()
            onTick(progress, true)
            this.stop()
            onComplete(result)
            return // Exit animation loop
          }
        }

        // Update UI with latest progress
        const progress = this.simulation.getProgress()
        const isComplete = this.simulation.isComplete()
        onTick(progress, isComplete)

        // Update last tick time (subtract remainder for accuracy)
        this.lastTickTime = currentTime - (elapsed % this.tickInterval)
      }

      // Continue animation loop
      this.rafId = requestAnimationFrame(animate)
    }

    // Start animation loop
    this.rafId = requestAnimationFrame(animate)
  }

  /**
   * Stop the simulation loop
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * Get current progress (if simulation exists)
   */
  getProgress(): HorseProgress[] | null {
    return this.simulation ? this.simulation.getProgress() : null
  }

  /**
   * Check if simulation is complete
   */
  isComplete(): boolean {
    return this.simulation ? this.simulation.isComplete() : false
  }

  /**
   * Get results (only call when complete)
   */
  getResults(): RoundResult | null {
    return this.simulation ? this.simulation.getResults() : null
  }

  /**
   * Check if simulation is running
   */
  isRunning(): boolean {
    return this.rafId !== null
  }

  /**
   * Check if simulation exists
   */
  hasSimulation(): boolean {
    return this.simulation !== null
  }

  /**
   * Clean up simulation and animation frame
   */
  cleanup(): void {
    this.stop()
    this.simulation = null
    this.lastTickTime = 0
  }
}

// Singleton instance
export const simulationService = new SimulationService()

