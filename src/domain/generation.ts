import type { Horse, Round, HorseInLane } from './types'
import {
  HORSES_TOTAL,
  ROUNDS_TOTAL,
  HORSES_PER_ROUND,
  ROUND_DISTANCES,
  CONDITION_MIN,
  CONDITION_MAX,
  LANE_ORDER,
} from './constants'
import { createSeededRandom, randomInt, shuffleArray } from './rng'

const HORSE_NAMES = [
  'Thunder',
  'Lightning',
  'Storm',
  'Blaze',
  'Shadow',
  'Spirit',
  'Comet',
  'Flash',
  'Rocket',
  'Phoenix',
  'Titan',
  'Apollo',
  'Zeus',
  'Atlas',
  'Mercury',
  'Neptune',
  'Orion',
  'Pegasus',
  'Hercules',
  'Achilles',
]

const HORSE_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B739',
  '#52B788',
  '#E63946',
  '#A8DADC',
  '#457B9D',
  '#F4A261',
  '#E76F51',
  '#2A9D8F',
  '#E9C46A',
  '#F4ACB7',
  '#9D84B7',
  '#FFB4A2',
]

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

