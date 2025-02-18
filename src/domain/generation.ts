import type { Horse, Round, HorseInLane } from './types'
import {
  HORSES_TOTAL,
  ROUNDS_TOTAL,
  HORSES_PER_ROUND,
  ROUND_DISTANCES,
  CONDITION_MIN,
  CONDITION_MAX,
  LANE_ORDER,
  HORSE_NAMES,
  HORSE_COLORS,
} from './constants'
import { createSeededRandom, randomInt, shuffleArray } from './rng'


export function generateHorses(seed: number = Date.now()): Horse[] {
  const random = createSeededRandom(seed)
  const horses: Horse[] = []

  for (let i = 0; i < HORSES_TOTAL; i++) {
    horses.push({
      id: i + 1,
      name: HORSE_NAMES[i]!,
      color: HORSE_COLORS[i]!,
      condition: randomInt(random, CONDITION_MIN, CONDITION_MAX),
    })
  }

  return horses
}

// Assign lanes like in swimming: strongest in middle, weakest on edges
// Lane assignment for 10 horses: [5,6,4,7,3,8,2,9,1,10]
// Best horse gets lane 5, 2nd best gets lane 6, 3rd gets lane 4, etc.
function assignLanes(horses: Horse[]): HorseInLane[] {
  // Sort by condition (strongest first)
  const sorted = [...horses].sort((a, b) => b.condition - a.condition)

  return sorted.map((horse, index) => ({
    horse,
    lane: LANE_ORDER[index]!,
  }))
}

export function generateSchedule(horses: Horse[], seed: number = Date.now()): Round[] {
  const random = createSeededRandom(seed)
  const rounds: Round[] = []

  for (let i = 0; i < ROUNDS_TOTAL; i++) {
    const shuffled = shuffleArray(random, horses)
    const selectedHorses = shuffled.slice(0, HORSES_PER_ROUND)

    // Assign lanes based on condition (swimming-style)
    const horsesWithLanes = assignLanes(selectedHorses)

    rounds.push({
      roundNumber: i + 1,
      distance: ROUND_DISTANCES[i]!,
      horses: horsesWithLanes,
    })
  }

  return rounds
}
