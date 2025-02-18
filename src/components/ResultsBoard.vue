<template>
  <article class="results-board">
    <h2>Results</h2>
    <p v-if="results.length === 0" class="empty-state">No results yet</p>
    <div v-else class="results-container">
      <nav class="tabs" aria-label="Race results navigation">
        <button
          v-for="result in results"
          :key="result.roundNumber"
          class="tab"
          :class="{ active: activeTab === result.roundNumber }"
          :aria-selected="activeTab === result.roundNumber"
          @click="activeTab = result.roundNumber"
        >
          Round {{ result.roundNumber }}
        </button>
      </nav>
      <div class="tab-content" role="tabpanel">
        <div v-for="result in results" :key="result.roundNumber" class="result-wrapper">
          <section v-if="activeTab === result.roundNumber" class="result-card">
            <header class="result-header">
              <span class="result-round">Round {{ result.roundNumber }}</span>
              <span class="result-distance">{{ result.distance }}m</span>
            </header>
            <ol class="rankings" aria-label="Race rankings">
              <li
                v-for="ranking in result.rankings"
                :key="ranking.horse.id"
                class="ranking-row"
                :class="{ podium: ranking.position <= PODIUM_POSITIONS }"
              >
                <div class="ranking-position" :class="`position-${ranking.position}`">
                  {{ ranking.position }}
                  <span v-if="ranking.position === GOLD_MEDAL_POSITION" aria-label="Gold medal">🥇</span>
                  <span v-else-if="ranking.position === SILVER_MEDAL_POSITION" aria-label="Silver medal">🥈</span>
                  <span v-else-if="ranking.position === BRONZE_MEDAL_POSITION" aria-label="Bronze medal">🥉</span>
                </div>
                <div class="ranking-horse">
                  <span class="result-lane">{{ ranking.lane }}</span>
                  <div class="horse-color-dot" :style="{ backgroundColor: ranking.horse.color }"></div>
                  <span class="horse-name">{{ ranking.horse.name }}</span>
                </div>
                <div class="ranking-time">{{ ranking.time.toFixed(2) }}s</div>
              </li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, watch, ref } from 'vue'
import { useStore } from 'vuex'
import type { RootState } from '@/store'
import {
  GOLD_MEDAL_POSITION,
  SILVER_MEDAL_POSITION,
  BRONZE_MEDAL_POSITION,
  PODIUM_POSITIONS,
} from '@/domain/constants'

const store = useStore<RootState>()

const results = computed(() => store.state.race.results)
const activeTab = ref(1)

// Auto-switch to latest result when new result arrives
watch(
  () => results.value.length,
  (newLength) => {
    if (newLength > 0) {
      activeTab.value = results.value[newLength - 1]!.roundNumber
    }
  }
)
</script>

<style scoped>
.results-board {
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

.results-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
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

.tab-content {
  min-height: 400px;
}

.result-card {
  background: var(--color-bg-card);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-gray-300);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-gray-200);
}

.result-round {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
}

.result-distance {
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
}

.rankings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.ranking-row {
  display: grid;
  grid-template-columns: 50px 1fr 80px;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-base);
}

.ranking-row:hover {
  background-color: var(--color-bg-secondary);
}

.ranking-row.podium {
  background-color: #fff3cd;
}

.ranking-position {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-gray-700);
  text-align: center;
}

.position-1 {
  color: var(--color-gold);
}

.position-2 {
  color: var(--color-silver)
}

.position-3 {
  color: var(--color-bronze);
}

.ranking-horse {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.result-lane {
  background: var(--color-gray-600);
  color: var(--color-text-white);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  width: var(--spacing-2xl);
  height: var(--spacing-2xl);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.horse-color-dot {
  width: var(--spacing-lg);
  height: var(--spacing-lg);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.horse-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.ranking-time {
  text-align: right;
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  font-variant-numeric: tabular-nums;
}
</style>

