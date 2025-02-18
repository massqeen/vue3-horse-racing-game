<template>
  <div class="controls-panel">
    <button class="btn btn-primary" :disabled="!canGenerate" @click="handleGenerate">
      Generate
    </button>
    <button
      class="btn btn-success"
      :disabled="!canStart && phase !== 'finished'"
      @click="handleStart"
    >
      {{ startButtonText }}
    </button>
    <div class="status-indicator" :class="phaseClass">
      {{ phaseLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '@/store'

const store = useStore<RootState>()

const canGenerate = computed(() => store.getters['ui/canGenerate'])
const canStart = computed(() => store.getters['ui/canStart'])
const phase = computed(() => store.state.ui.phase)
const currentRoundIndex = computed(() => store.state.race.currentRoundIndex)
const totalRounds = computed(() => store.state.race.schedule.length)

const startButtonText = computed(() => {
  // If all rounds finished, show Reset
  if (phase.value === 'finished') {
    return 'Reset Game'
  }

  if (currentRoundIndex.value < 0) {
    return 'Start Race'
  }

  const nextRound = currentRoundIndex.value + 2 // +1 for next, +1 for 1-based

  // Don't show round number beyond total rounds
  if (nextRound > totalRounds.value) {
    return 'All Finished'
  }

  return `Start Round ${nextRound}`
})

const phaseClass = computed(() => {
  switch (phase.value) {
    case 'idle':
      return 'status-idle'
    case 'generated':
      return 'status-ready'
    case 'running':
      return 'status-running'
    case 'finished':
      return 'status-finished'
    default:
      return ''
  }
})

const phaseLabel = computed(() => {
  switch (phase.value) {
    case 'idle':
      return 'Ready to Generate'
    case 'generated':
      if (currentRoundIndex.value < 0) {
        return 'Ready to Start'
      }
      const completed = currentRoundIndex.value + 1
      return `Round ${completed}/${totalRounds.value} Complete`
    case 'running':
      const current = currentRoundIndex.value + 1
      return `Racing Round ${current}/${totalRounds.value}...`
    case 'finished':
      return 'All Rounds Finished!'
    default:
      return ''
  }
})

async function handleGenerate() {
  // Guard: check if generation is allowed
  if (!canGenerate.value) {
    console.warn('[ControlsPanel] Generate is not allowed in current state')
    return
  }

  // Additional guard: prevent if race is running
  if (phase.value === 'running') {
    console.warn('[ControlsPanel] Cannot generate during race')
    return
  }

  await store.dispatch('horses/generate')
  await store.dispatch('race/generateSchedule')
  await store.dispatch('ui/setPhase', 'generated')
}

function handleStart() {
  // If game finished, reset instead of starting
  if (phase.value === 'finished') {
    handleReset()
    return
  }

  // Guard: check if start is allowed
  if (!canStart.value) {
    console.warn('[ControlsPanel] Start is not allowed in current state')
    return
  }

  // Additional guard: prevent if already running
  if (phase.value === 'running') {
    console.warn('[ControlsPanel] Race is already running')
    return
  }

  store.dispatch('race/startRaces')
}

function handleReset() {
  store.dispatch('horses/reset')
  store.dispatch('race/reset')
  store.dispatch('ui/reset')
}
</script>

<style scoped>
.controls-panel {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.btn {
  padding: var(--spacing-md) var(--spacing-3xl);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive adjustments for mobile */
@media (max-width: 640px) {
  .btn {
    flex: 1 1 auto;
    min-width: 120px;
    padding: var(--spacing-sm) var(--spacing-lg);
    font-size: var(--font-size-md);
  }
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-primary);
  color: var(--color-text-white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-bg-primary-btn-hover);
}

.btn-success {
  background: var(--color-success);
  color: var(--color-text-white);
}

.btn-success:hover:not(:disabled) {
  background: var(--color-bg-btn-hover);
}

.status-indicator {
  margin-left: auto;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-idle {
  background: var(--color-gray-200);
  color: var(--color-gray-600);
}

.status-ready {
  background: var(--color-bg-status-ready);
  color: var(--color-status-ready);
}

.status-running {
  background: var(--color-bg-status-running);
  color: var(--color-status-running);
  animation: pulse 1.5s ease-in-out infinite;
}

.status-finished {
  background: var(--color-bg-status-finished);
  color: var(--color-status-finished);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
