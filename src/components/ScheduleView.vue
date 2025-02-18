<template>
  <article class="schedule-view">
    <h2>Race Schedule</h2>
    <p v-if="schedule.length === 0" class="empty-state">
      No schedule generated. Click "Generate" to create one.
    </p>
    <div v-else class="schedule-container">
      <nav class="tabs" aria-label="Schedule rounds navigation">
        <button
          v-for="round in schedule"
          :key="round.roundNumber"
          class="tab"
          :class="{
            active: activeTab === round.roundNumber,
            current: currentRoundNumber === round.roundNumber
          }"
          :aria-selected="activeTab === round.roundNumber"
          @click="activeTab = round.roundNumber"
        >
          Round {{ round.roundNumber }}
        </button>
      </nav>
      <div class="tab-content" role="tabpanel">
        <div v-for="round in schedule" :key="round.roundNumber">
          <section v-if="activeTab === round.roundNumber" class="round-details">
            <header class="round-header">
              <h3 class="round-title">Round {{ round.roundNumber }}</h3>
              <span class="round-distance">{{ round.distance }}m</span>
            </header>
            <table class="horses-table">
              <thead>
                <tr class="table-header">
                  <th class="col-lane">Lane</th>
                  <th class="col-horse">Horse</th>
                  <th class="col-condition">Condition</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="horseInLane in sortedByLane(round.horses)"
                  :key="horseInLane.horse.id"
                  class="table-row"
                >
                  <td class="col-lane">
                    <span class="lane-badge">{{ horseInLane.lane }}</span>
                  </td>
                  <td class="col-horse">
                    <div class="horse-cell-content">
                      <div class="horse-color-dot" :style="{ backgroundColor: horseInLane.horse.color }"></div>
                      <span class="horse-name">{{ horseInLane.horse.name }}</span>
                    </div>
                  </td>
                  <td class="col-condition">
                    <span class="condition-value">{{ horseInLane.horse.condition }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '@/store'
import type { HorseInLane } from '@/domain/types'

const store = useStore<RootState>()

const schedule = computed(() => store.state.race.schedule)
const currentRoundNumber = computed(() => {
  const index = store.state.race.currentRoundIndex
  return index >= 0 ? index + 1 : null
})

const activeTab = ref(1)

// Sync active tab with store
watch(activeTab, (newTab) => {
  store.dispatch('ui/setSelectedScheduleRound', newTab)
})


// Auto-switch to current round when race starts
watch(currentRoundNumber, (newRound) => {
  if (newRound) {
    activeTab.value = newRound
  }
})

// Reset to first tab when schedule is generated
watch(schedule, (newSchedule) => {
  if (newSchedule.length > 0) {
    if (activeTab.value > newSchedule.length) {
      activeTab.value = 1
    }
    // Update store with initial selection
    store.dispatch('ui/setSelectedScheduleRound', activeTab.value)
  } else {
    store.dispatch('ui/setSelectedScheduleRound', null)
  }
})

// Sort horses by lane number for logical display
function sortedByLane(horses: HorseInLane[]): HorseInLane[] {
  return [...horses].sort((a, b) => a.lane - b.lane)
}
</script>

<style scoped>
.schedule-view {
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

.schedule-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  flex: 1;
}

.tabs {
  display: flex;
  gap: var(--spacing-sm);
  border-bottom: 2px solid var(--color-gray-300);
  overflow-x: auto;
  scrollbar-width: thin;
}

.tab {
  padding: 10px var(--spacing-xl);
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  border-bottom: 3px solid transparent;
  transition: all var(--transition-base);
  white-space: nowrap;
  font-size: var(--font-size-md);
}

.tab:hover {
  color: var(--color-primary);
  background: var(--color-primary-light);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.tab.current {
  background: var(--color-success-light);
}

.tab-content {
  flex: 1;
  overflow-y: auto;
}

.round-details {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-gray-300);
}

.round-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-gray-200);
}

.round-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.round-distance {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary);
  background: var(--color-primary-medium);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-xl);
}

.horses-table {
  width: 100%;
  border-collapse: collapse;
}

.table-header {
  background: var(--color-bg-secondary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.table-header th {
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: left;
}

.table-header th.col-lane {
  width: 70px;
}

.table-header th.col-condition {
  width: 100px;
}

.table-row {
  border-bottom: 1px solid var(--color-gray-100);
  transition: background var(--transition-base);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--color-bg-secondary);
}

.table-row td {
  padding: 10px var(--spacing-md);
  vertical-align: middle;
}

.col-lane {
  text-align: center;
}

.horse-cell-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.col-condition {
  text-align: center;
}

.lane-badge {
  background: var(--color-primary);
  color: var(--color-text-white);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}


.horse-color-dot {
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
  border-radius: var(--radius-full);
  flex-shrink: 0;
  border: 2px solid var(--color-white);
  box-shadow: 0 0 0 1px var(--color-gray-300);
}

.horse-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

.condition-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
  font-size: var(--font-size-md);
}
</style>



