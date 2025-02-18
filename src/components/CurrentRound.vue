<template>
  <div class="current-round">
    <h2>Current Race</h2>
    <div v-if="!currentRound" class="empty-state">No race in progress</div>
    <div v-else class="race-container">
      <div class="race-info">
        <span class="round-label">Round {{ currentRound.roundNumber }}</span>
        <span class="distance-label">{{ currentRound.distance }}m</span>
      </div>
      <div class="race-track" :class="{ transitioning: isTransitioning }">
        <div
          v-for="horseInLane in displayedHorses"
          :key="horseInLane.horse.id"
          class="track-lane"
          :class="{
            leader: isLeader(horseInLane.horse.id),
            hovered: isHovered(horseInLane.horse.id)
          }"
        >
          <span v-if="isLeader(horseInLane.horse.id)" class="leader-badge">👑</span>
          <div class="lane-info">
            <span class="lane-number">{{ horseInLane.lane }}</span>
            <div class="horse-details">
              <span class="horse-name">
                {{ horseInLane.horse.name }}
              </span>
              <span class="horse-condition">{{ horseInLane.horse.condition }}</span>
            </div>
          </div>
          <div class="lane-track-wrapper">
            <div class="start-line"></div>
            <div class="finish-line"></div>
            <div class="lane-track">
              <div
                class="horse-icon"
                :style="{
                  backgroundColor: horseInLane.horse.color,
                  left: getHorsePosition(horseInLane.horse.id) + '%',
                }"
              >
                🐴
              </div>
            </div>
          </div>
          <div class="lane-progress">
            <template v-if="getFinishPosition(horseInLane.horse.id)">
              <span class="finish-position">
                <span class="position-number">{{ getFinishPosition(horseInLane.horse.id) }}</span>
                <span v-if="getFinishPosition(horseInLane.horse.id) === GOLD_MEDAL_POSITION">🥇</span>
                <span v-else-if="getFinishPosition(horseInLane.horse.id) === SILVER_MEDAL_POSITION">🥈</span>
                <span v-else-if="getFinishPosition(horseInLane.horse.id) === BRONZE_MEDAL_POSITION">🥉</span>
              </span>
            </template>
            <template v-else>
              {{ getHorsePosition(horseInLane.horse.id).toFixed(1) }}%
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '@/store'
import type { HorseInLane } from '@/domain/types'
import {
  ROUND_TRANSITION_DURATION_MS,
  DOM_UPDATE_DELAY_MS,
  FINISH_POSITION_THRESHOLD,
  GOLD_MEDAL_POSITION,
  SILVER_MEDAL_POSITION,
  BRONZE_MEDAL_POSITION,
} from '@/domain/constants'

const store = useStore<RootState>()

const currentRound = computed(() => store.getters['race/currentRound'])
const currentProgress = computed(() => store.state.race.currentProgress)
const hoveredHorseId = computed(() => store.state.ui.hoveredHorseId)

// Track the first horse to finish (lock leader)
const firstFinisherId = ref<number | null>(null)

// Track if round is transitioning (for smooth animation)
const isTransitioning = ref(false)

// Snapshot of horses for transition (freeze display during fade)
const displayedHorses = ref<HorseInLane[]>([])

// Snapshot of progress for transition (freeze positions during fade)
const displayedProgress = ref(new Map<number, { position: number; finishPosition?: number }>())

// Sort horses by lane number for consistent display
const sortedHorsesByLane = computed(() => {
  if (!currentRound.value) return []
  return [...currentRound.value.horses].sort((a, b) => a.lane - b.lane)
})

// Update displayed horses when not transitioning
watch(sortedHorsesByLane, (newHorses) => {
  if (!isTransitioning.value) {
    displayedHorses.value = newHorses
  }
})

// Update displayed progress when not transitioning
// No deep watch needed - currentProgress array reference changes on updates
watch(currentProgress, (newProgress) => {
  if (!isTransitioning.value) {
    const progressMap = new Map<number, { position: number; finishPosition?: number }>()
    newProgress.forEach(p => {
      progressMap.set(p.horseId, {
        position: p.position,
        finishPosition: p.finishPosition
      })
    })
    displayedProgress.value = progressMap
  }
})

// Reset first finisher when round changes
watch(currentRound, (newRound, oldRound) => {
  if (oldRound && newRound && oldRound.roundNumber !== newRound.roundNumber) {
    // Round changed - trigger transition with frozen display
    isTransitioning.value = true

    // After fade-out completes, update data THEN start fade-in
    setTimeout(() => {
      // Update horses
      displayedHorses.value = sortedHorsesByLane.value

      // Update progress
      const progressMap = new Map<number, { position: number; finishPosition?: number }>()
      currentProgress.value.forEach(p => {
        progressMap.set(p.horseId, {
          position: p.position,
          finishPosition: p.finishPosition
        })
      })
      displayedProgress.value = progressMap

      firstFinisherId.value = null

      // Small delay to ensure DOM updates before fade-in starts
      setTimeout(() => {
        isTransitioning.value = false // Start fade-in with new data
      }, DOM_UPDATE_DELAY_MS)
    }, ROUND_TRANSITION_DURATION_MS)
  } else {
    firstFinisherId.value = null
    displayedHorses.value = sortedHorsesByLane.value

    // Initialize progress on first load
    const progressMap = new Map<number, { position: number; finishPosition?: number }>()
    currentProgress.value.forEach(p => {
      progressMap.set(p.horseId, {
        position: p.position,
        finishPosition: p.finishPosition
      })
    })
    displayedProgress.value = progressMap
  }
})

// Watch progress and lock the first finisher
// No deep watch needed - array reference changes
watch(currentProgress, (progress) => {
  if (firstFinisherId.value !== null) return // Already locked

  // Find if anyone finished
  const finisher = progress.find(p => p.position >= FINISH_POSITION_THRESHOLD)
  if (finisher) {
    firstFinisherId.value = finisher.horseId
  }
})


// Find current leader
const leaderId = computed(() => {
  if (currentProgress.value.length === 0) return null

  // If someone finished, they stay as leader
  if (firstFinisherId.value !== null) {
    return firstFinisherId.value
  }


  // Otherwise, return current leader (highest progress)
  const leader = currentProgress.value.reduce((max, curr) =>
    curr.position > max.position ? curr : max
  )

  return leader.horseId
})

function getHorsePosition(horseId: number): number {
  // During transition, horses are frozen at finish (100%)
  if (isTransitioning.value) {
    return FINISH_POSITION_THRESHOLD
  }

  // Normal operation - use live progress
  const progress = currentProgress.value.find((p) => p.horseId === horseId)
  return progress ? progress.position : 0
}

function getFinishPosition(horseId: number): number | undefined {
  // During transition, use frozen finish positions
  if (isTransitioning.value) {
    const frozen = displayedProgress.value.get(horseId)
    return frozen?.finishPosition
  }

  // Normal operation - use live progress
  const progress = currentProgress.value.find((p) => p.horseId === horseId)
  return progress?.finishPosition
}

function isLeader(horseId: number): boolean {
  return leaderId.value === horseId
}

function isHovered(horseId: number): boolean {
  return hoveredHorseId.value === horseId
}
</script>

<style scoped>
.current-round {
  padding: var(--spacing-xl);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  height: 100%;
}

h2 {
  margin: 0 0 var(--spacing-lg) 0;
  color: var(--color-text-primary);
  font-size: var(--spacing-xl);
  font-weight: var(--font-weight-semibold);
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--color-text-secondary);
  font-style: italic;
}

.race-container {
  background: var(--color-bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-md);
}

.race-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-gray-200);
}

.round-label {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.distance-label {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.race-track {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  transition: opacity var(--transition-slower) ease-in-out;
}

/* Fade out/in animation when round changes */
.race-track.transitioning {
  opacity: 0;
}

.track-lane {
  display: grid;
  grid-template-columns: 140px 1fr 60px;
  align-items: center;
  gap: var(--spacing-md);
  transition: all var(--transition-slow);
  position: relative;
}


.track-lane.leader {
  background: linear-gradient(90deg, var(--color-gold-04) 0%, transparent 100%);
}

/* Leader left border using ::before to avoid layout shift */
.track-lane.leader::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-gold);
  pointer-events: none;
}

.track-lane.hovered {
  background: linear-gradient(90deg, var(--color-primary-hover) 0%, transparent 100%);
}

/* Hovered left border using ::before to avoid layout shift */
.track-lane.hovered::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
  pointer-events: none;
}

.track-lane.hovered .horse-icon {
  box-shadow: var(--shadow-hover);
  filter: brightness(1.2);
}

.leader-badge {
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-xl);
  animation: bounce 1s ease-in-out infinite;
  z-index: var(--z-dropdown);
  pointer-events: none;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.lane-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.lane-number {
  background: var(--color-primary);
  color: var(--color-text-white);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.horse-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.horse-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}


.horse-condition {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.lane-track-wrapper {
  position: relative;
  padding: 0 var(--spacing-xl);
}

.lane-track {
  position: relative;
  height: 40px;
  background: linear-gradient(to bottom, var(--color-gray-200) 0%, var(--color-gray-200) 50%, var(--color-gray-300) 50%, var(--color-gray-300) 100%);
  border-radius: var(--radius-sm);
  overflow: visible;
}

/* Start line indicator */
.start-line {
  position: absolute;
  left: var(--spacing-xl);
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom,
    transparent 0%,
    var(--color-success) 10%,
    var(--color-success) 90%,
    transparent 100%
  );
  z-index: var(--z-base);
  pointer-events: none;
}

/* Finish line indicator */
.finish-line {
  position: absolute;
  right: var(--spacing-xl);
  top: 0;
  bottom: 0;
  width: 4px;
  background: repeating-linear-gradient(
    45deg,
    var(--color-black),
    var(--color-black) 5px,
    var(--color-white) 5px,
    var(--color-white) 10px
  );
  z-index: var(--z-base);
  box-shadow: 0 0 var(--spacing-sm) var(--color-black-03);
  pointer-events: none;
}

/* Add checkered flag emoji after finish line */
.finish-line::after {
  content: '🏁';
  position: absolute;
  right: -28px;
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--spacing-xl);
  text-shadow: var(--shadow-text);
}

.horse-icon {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  transition: left var(--transition-fast) linear;
  box-shadow: var(--shadow-md);
  z-index: 2;
}

.lane-progress {
  text-align: right;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  font-variant-numeric: tabular-nums;
  min-width: 60px;
}

.finish-position {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
}

.position-number {
  background: var(--color-success);
  color: var(--color-text-white);
  padding: 2px var(--spacing-sm);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-md);
}
</style>

