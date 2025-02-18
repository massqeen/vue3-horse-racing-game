export const HORSES_TOTAL = 20
export const ROUNDS_TOTAL = 6
export const HORSES_PER_ROUND = 10

export const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] // meters

// Condition range: 80-100 (only elite competitive horses)
export const CONDITION_MIN = 80
export const CONDITION_MAX = 100

// Simulation constants
export const SIMULATION_TICK_MS = 100 // Update every 100ms

// === Speed calculation ===
export const BASE_SPEED = 15 // meters per second
export const BASE_CONDITION = 90 // Базовое значение condition для расчёта скорости
export const CONDITION_SPEED_FACTOR = 0.15 // Влияние condition на скорость (±1.5% за каждые 10 пунктов)

// === Random variation ===
export const MIN_VARIATION = 0.8 // Минимальная вариация скорости (-20%)
export const MAX_VARIATION = 1.2 // Максимальная вариация скорости (+20%)
export const VARIATION_RANGE = MAX_VARIATION - MIN_VARIATION // 0.4

// === Daily form (applies to whole race) ===
export const MIN_DAILY_FORM = 0.95 // Минимальная дневная форма (-5%)
export const MAX_DAILY_FORM = 1.05 // Максимальная дневная форма (+5%)
export const DAILY_FORM_RANGE = MAX_DAILY_FORM - MIN_DAILY_FORM // 0.10

// === Start burst (active for first 20% of race) ===
export const MIN_START_BURST = 0.92 // Минимальный стартовый буст (-8%)
export const MAX_START_BURST = 1.08 // Максимальный стартовый буст (+8%)
export const START_BURST_RANGE = MAX_START_BURST - MIN_START_BURST // 0.16
export const START_BURST_DURATION_PERCENT = 20 // Длительность стартового буста (первые 20% дистанции)

// === Stamina system (activates after 50% of race) ===
export const STAMINA_ACTIVATION_PERCENT = 50 // Стамина начинает действовать с середины гонки

// Stamina thresholds (condition ranges)
export const ELITE_STAMINA_MIN = 95 // Элитная стамина (condition >= 95)
export const VERY_GOOD_STAMINA_MIN = 90 // Очень хорошая стамина (condition >= 90)
export const GOOD_STAMINA_MIN = 85 // Хорошая стамина (condition >= 85)
export const BELOW_AVERAGE_STAMINA_MIN = 82 // Ниже среднего (condition >= 82)
// Below 82 = Low stamina (низкая стамина)

// Stamina effects (speed multipliers)
export const ELITE_STAMINA_BOOST = 0.05 // Элитная стамина: +5% к скорости
export const VERY_GOOD_STAMINA_BOOST = 0.02 // Очень хорошая стамина: +2% к скорости
export const BELOW_AVERAGE_STAMINA_PENALTY = 0.03 // Ниже среднего: -3% к скорости
export const LOW_STAMINA_PENALTY = 0.10 // Низкая стамина: -10% к скорости

// === Lane assignment ===
export const TOTAL_LANES = 10 // Всего дорожек на старте
export const LANE_ORDER = [5, 6, 4, 7, 3, 8, 2, 9, 1, 10] // Swimming-style: сильнейшие в центре

// === UI Timing ===
export const ROUND_TRANSITION_DURATION_MS = 500 // Длительность fade out/in анимации
export const DOM_UPDATE_DELAY_MS = 20 // Задержка перед fade-in для обновления DOM
export const ROUND_COMPLETION_DELAY_MS = 800 // Задержка перед разрешением следующего раунда

// === Race positions ===
export const FINISH_POSITION_THRESHOLD = 100 // 100% прогресса = финиш
export const SCHEDULE_SEED_OFFSET = 1 // Смещение seed для генерации расписания
export const ROUND_SEED_OFFSET = 2 // Смещение seed для симуляции раундов

// === Medal positions ===
export const GOLD_MEDAL_POSITION = 1
export const SILVER_MEDAL_POSITION = 2
export const BRONZE_MEDAL_POSITION = 3
export const PODIUM_POSITIONS = 3 // Количество призовых мест

