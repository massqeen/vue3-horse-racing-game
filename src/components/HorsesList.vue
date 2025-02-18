<template>
  <article class="horses-list">
    <h2>Horses</h2>
    <p v-if="horses.length === 0" class="empty-state">No horses generated yet</p>
    <ul v-else class="horses-grid">
      <li
        v-for="horse in sortedHorses"
        :key="horse.id"
        class="horse-card"
        :class="{ inactive: isHorseInactive(horse.id), favorite: isFavorite(horse.id) }"
        :style="{ borderColor: horse.color }"
        @mouseenter="handleHoverEnter(horse.id)"
        @mouseleave="handleHoverLeave"
      >
        <div class="horse-color" :style="{ backgroundColor: horse.color }"></div>
        <div class="horse-info">
          <strong class="horse-name">
            {{ horse.name }}
            <span v-if="isFavorite(horse.id)" class="favorite-badge" aria-label="Favorite">⭐</span>
          </strong>
          <div class="horse-stats">
            <span class="stat-label">Condition:</span>
            <span class="stat-value">{{ horse.condition }}</span>
          </div>
        </div>
      </li>
    </ul>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '@/store'
import { useHoveredHorse } from '@/composables/useHoveredHorse'
import { useSelectedScheduleRound } from '@/composables/useSelectedScheduleRound'

const store = useStore<RootState>()
const { setHoveredHorse, clearHover } = useHoveredHorse()
const { selectedScheduleRound } = useSelectedScheduleRound()

const horses = computed(() => store.state.horses.horses)
const schedule = computed(() => store.state.race.schedule)
const currentRound = computed(() => store.getters['race/currentRound'])

// Get horses participating in selected round
const activeRoundHorseIds = computed(() => {
  if (!selectedScheduleRound.value) return null
  const round = schedule.value.find(r => r.roundNumber === selectedScheduleRound.value)
  if (!round) return null
  return new Set(round.horses.map(h => h.horse.id))
})

// Get horses participating in current racing round
const currentRaceHorseIds = computed(() => {
  if (!currentRound.value) return null
  return new Set(currentRound.value.horses.map((h: { horse: { id: number } }) => h.horse.id))
})

// Smart sorting: active horses first (by condition desc), then inactive (by condition desc)
const sortedHorses = computed(() => {
  if (!activeRoundHorseIds.value) {
    // No round selected - just sort by condition descending
    return [...horses.value].sort((a, b) => b.condition - a.condition)
  }

  const active = horses.value.filter(h => activeRoundHorseIds.value!.has(h.id))
  const inactive = horses.value.filter(h => !activeRoundHorseIds.value!.has(h.id))

  // Sort both groups by condition (strongest first)
  active.sort((a, b) => b.condition - a.condition)
  inactive.sort((a, b) => b.condition - a.condition)

  return [...active, ...inactive]
})

// Check if horse should be dimmed (not in active round)
function isHorseInactive(horseId: number): boolean {
  if (!activeRoundHorseIds.value) return false
  return !activeRoundHorseIds.value.has(horseId)
}

// Check if horse is the favorite (strongest in active round)
function isFavorite(horseId: number): boolean {
  if (!activeRoundHorseIds.value) return false
  if (!activeRoundHorseIds.value.has(horseId)) return false

  // First active horse in sorted list is the favorite
  const firstActive = sortedHorses.value.find(h => activeRoundHorseIds.value!.has(h.id))
  return firstActive?.id === horseId
}

// Handle hover to highlight horse in race view
// Only trigger for horses participating in current race
function handleHoverEnter(horseId: number) {
  // Only hover if there's a current race and this horse is participating
  if (currentRaceHorseIds.value && currentRaceHorseIds.value.has(horseId)) {
    setHoveredHorse(horseId)
  }
}

function handleHoverLeave() {
  clearHover()
}
</script>

<style scoped>
.horses-list {
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

.horses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing-md);
  list-style-type: none;
  padding: 0;
}

/* Responsive adjustments for mobile */
@media (max-width: 480px) {
  .horses-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }
}

.horse-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  transition: all var(--transition-slow);
}

.horse-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.horse-card.inactive {
  opacity: 0.35;
  filter: grayscale(70%);
}

.horse-card.inactive:hover {
  opacity: 0.5;
  transform: none;
}

.horse-card.favorite {
  border-width: 3px;
  box-shadow: 0 4px 12px var(--color-gold-04);
  background: var(--color-bg-favorite);
}

.horse-card.favorite:hover {
  box-shadow: 0 6px 16px var(--color-gold-05);
}

.favorite-badge {
  margin-left: var(--spacing-sm);
  font-size: var(--font-size-lg);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

.horse-color {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.horse-info {
  flex: 1;
  min-width: 0;
}

.horse-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.horse-stats {
  display: flex;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stat-label {
  font-weight: var(--font-weight-medium);
}

.stat-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
}
</style>

