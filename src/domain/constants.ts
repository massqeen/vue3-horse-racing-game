export const HORSES_TOTAL = 20
export const ROUNDS_TOTAL = 6
export const HORSES_PER_ROUND = 10

export const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] // meters

// Horse names configuration
export const HORSE_NAMES = [
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

// Horse colors configuration
export const HORSE_COLORS = [
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

// Condition range: 80-100 (only elite competitive horses)
export const CONDITION_MIN = 80
export const CONDITION_MAX = 100

// Test mode detection (for E2E tests acceleration)
// Check localStorage for E2E test flag
const isE2ETest =
  typeof localStorage !== 'undefined' && localStorage.getItem('__E2E_TEST_MODE__') === 'true'
const isTestMode = import.meta.env.MODE === 'test' || isE2ETest


// Simulation constants
// In test mode: 200x faster (1ms tick, 3000 m/s base speed)
export const SIMULATION_TICK_MS = isTestMode ? 1 : 100 // Update every 1ms in tests, 100ms in prod
export const BASE_SPEED = isTestMode ? 3000 : 15 // 3000 m/s in tests, 15 m/s in production
export const BASE_CONDITION = 90 // Base condition value for speed calculation
export const CONDITION_SPEED_FACTOR = 0.15 // Condition influence on speed (±1.5% per 10 points)

// === Random variation ===
export const MIN_VARIATION = 0.8 // Minimum speed variation (-20%)
export const MAX_VARIATION = 1.2 // Maximum speed variation (+20%)
export const VARIATION_RANGE = MAX_VARIATION - MIN_VARIATION // 0.4

// === Daily form (applies to whole race) ===
export const MIN_DAILY_FORM = 0.95 // Minimum daily form (-5%)
export const MAX_DAILY_FORM = 1.05 // Maximum daily form (+5%)
export const DAILY_FORM_RANGE = MAX_DAILY_FORM - MIN_DAILY_FORM // 0.10

// === Start burst (active for first 20% of race) ===
export const MIN_START_BURST = 0.92 // Minimum start burst (-8%)
export const MAX_START_BURST = 1.08 // Maximum start burst (+8%)
export const START_BURST_RANGE = MAX_START_BURST - MIN_START_BURST // 0.16
export const START_BURST_DURATION_PERCENT = 20 // Start burst duration (first 20% of distance)

// === Stamina system (activates after 50% of race) ===
export const STAMINA_ACTIVATION_PERCENT = 50 // Stamina starts affecting from race midpoint

// Stamina thresholds (condition ranges)
export const ELITE_STAMINA_MIN = 95 // Elite stamina (condition >= 95)
export const VERY_GOOD_STAMINA_MIN = 90 // Very good stamina (condition >= 90)
export const GOOD_STAMINA_MIN = 85 // Good stamina (condition >= 85)
export const BELOW_AVERAGE_STAMINA_MIN = 82 // Below average (condition >= 82)
// Below 82 = Low stamina

// Stamina effects (speed multipliers)
export const ELITE_STAMINA_BOOST = 0.05 // Elite stamina: +5% speed
export const VERY_GOOD_STAMINA_BOOST = 0.02 // Very good stamina: +2% speed
export const BELOW_AVERAGE_STAMINA_PENALTY = 0.03 // Below average: -3% speed
export const LOW_STAMINA_PENALTY = 0.10 // Low stamina: -10% speed

// === Lane assignment ===
export const TOTAL_LANES = 10 // Total number of lanes at start
export const LANE_ORDER = [5, 6, 4, 7, 3, 8, 2, 9, 1, 10] // Swimming-style: strongest in center

// === UI Timing ===
export const ROUND_TRANSITION_DURATION_MS = 500 // Fade out/in animation duration
export const DOM_UPDATE_DELAY_MS = 20 // Delay before fade-in for DOM update
export const ROUND_COMPLETION_DELAY_MS = 800 // Delay before allowing next round

// === Race positions ===
export const FINISH_POSITION_THRESHOLD = 100 // 100% progress = finish
export const SCHEDULE_SEED_OFFSET = 1 // Seed offset for schedule generation
export const ROUND_SEED_OFFSET = 2 // Seed offset for round simulation

// === Medal positions ===
export const GOLD_MEDAL_POSITION = 1
export const SILVER_MEDAL_POSITION = 2
export const BRONZE_MEDAL_POSITION = 3
export const PODIUM_POSITIONS = 3 // Number of podium positions
