<template>
  <div class="game-view">
    <header class="game-header">
      <h1>🐴 Horse Racing Game</h1>
      <ControlsPanel />
    </header>

    <main class="game-content">
      <section class="horses-list-card" aria-label="Horses List">
        <HorsesList />
      </section>
      <section class="current-round-card" aria-label="Current Race">
        <CurrentRound />
      </section>
      <section class="schedule-card" aria-label="Race Schedule">
        <ScheduleView />
      </section>
      <section class="results-card" aria-label="Race Results">
        <ResultsBoard />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import HorsesList from '@/components/HorsesList.vue'
import ScheduleView from '@/components/ScheduleView.vue'
import CurrentRound from '@/components/CurrentRound.vue'
import ResultsBoard from '@/components/ResultsBoard.vue'
import ControlsPanel from '@/components/ControlsPanel.vue'
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  background: var(--color-bg-body);
  padding: var(--spacing-xl);
}

.game-header {
  margin-bottom: var(--spacing-xl);
}

h1 {
  margin: 0 0 var(--spacing-xl) 0;
  color: var(--color-text-white);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
  text-shadow: var(--shadow-text);
}

.game-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  gap: var(--spacing-xl);
  align-items: stretch; /* Stretches the cards to the full row height */
}

/* Explicit grid positioning for perfect alignment */
.horses-list-card {
  grid-column: 1;
  grid-row: 1;
}

.current-round-card {
  grid-column: 2;
  grid-row: 1;
}

.schedule-card {
  grid-column: 1;
  grid-row: 2;
}

.results-card {
  grid-column: 2;
  grid-row: 2;
}

@media (max-width: 1200px) {
  .game-content {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }

  .horses-list-card,
  .current-round-card,
  .schedule-card,
  .results-card {
    grid-column: 1;
  }

  .horses-list-card {
    grid-row: 1;
  }

  .current-round-card {
    grid-row: 2;
  }

  .schedule-card {
    grid-row: 3;
  }

  .results-card {
    grid-row: 4;
  }
}
</style>

