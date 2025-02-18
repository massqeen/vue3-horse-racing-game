# Horse Speed Calculation Mechanism

**Project:** Horse Racing Game  
**File:** `src/domain/simulation.ts`  
**Functions:** `calculateSpeed()` and `calculateStaminaEffect()`

---

## 🎯 General Formula

```typescript
finalSpeed = BASE_SPEED × conditionFactor × formFactor × burstFactor × variation × staminaEffect
```

Where:
- **BASE_SPEED** = 15 m/s (base speed)
- **conditionFactor** - condition (stamina) influence factor
- **formFactor** - horse's daily form
- **burstFactor** - starting burst
- **variation** - random variation on each tick
- **staminaEffect** - endurance effect (works in second half of race)

---

## 📊 Parameters Affecting Speed

### 1. **Condition (Stamina) - Base Influence** ⭐

**Formula:**
```typescript
conditionFactor = 1 + ((condition - BASE_CONDITION) / CONDITION_MAX) × CONDITION_SPEED_FACTOR
```

**Constants:**
- `BASE_CONDITION` = 90 (base value)
- `CONDITION_MAX` = 100
- `CONDITION_SPEED_FACTOR` = 0.15 (±15% for 100 point difference)

**Examples:**
- Condition = 80: `1 + ((80-90)/100) × 0.15 = 1 - 0.015 = 0.985` → **-1.5% speed**
- Condition = 90: `1 + ((90-90)/100) × 0.15 = 1.000` → **base speed**
- Condition = 100: `1 + ((100-90)/100) × 0.15 = 1 + 0.015 = 1.015` → **+1.5% speed**

**Influence range:** from **-1.5%** to **+1.5%** (for condition 80-100)

---

### 2. **Random Variation** 🎲

**Formula:**
```typescript
variation = MIN_VARIATION + random() × VARIATION_RANGE
```

**Constants:**
- `MIN_VARIATION` = 0.8 (minimum -20%)
- `MAX_VARIATION` = 1.2 (maximum +20%)
- `VARIATION_RANGE` = 0.4

**Influence range:** from **0.8** to **1.2** (±20%)

**Goal:** High randomness on each tick creates unpredictability and excitement

---

### 3. **Daily Form** 📅

**Formula:**
```typescript
formFactor = MIN_DAILY_FORM + random() × DAILY_FORM_RANGE
```

**Constants:**
- `MIN_DAILY_FORM` = 0.95
- `MAX_DAILY_FORM` = 1.05
- `DAILY_FORM_RANGE` = 0.10

**Influence range:** from **0.95** to **1.05** (±5%)

**Feature:** Generated **once** at race start and applied throughout entire distance. Models horse's "mood" on this day.

---

### 4. **Start Burst** 🚀

**Formula:**
```typescript
startBurst = MIN_START_BURST + random() × START_BURST_RANGE
burstFactor = (raceProgress <= START_BURST_DURATION_PERCENT) ? startBurst : 1.0
```

**Constants:**
- `MIN_START_BURST` = 0.92
- `MAX_START_BURST` = 1.08
- `START_BURST_RANGE` = 0.16
- `START_BURST_DURATION_PERCENT` = 20 (first 20% of distance)

**Influence range:** from **0.92** to **1.08** (±8%)

**Feature:** 
- Active **only in first 20% of race**
- Generated once at start
- After 20% distance `burstFactor = 1.0`

**Models:** Explosive start or slow acceleration

---

### 5. **Stamina Effect (Endurance Effect)** 💪

**Activation:** After **50% distance** (`STAMINA_ACTIVATION_PERCENT = 50`)

**Formula:**
```typescript
if (progress < 50%) {
  staminaEffect = 1.0  // No influence in first half
} else {
  enduranceProgress = (progress - 50) / 50  // 0..1 (from 50% to 100%)
  
  if (condition >= 95)       staminaEffect = 1.0 + enduranceProgress × 0.05  // +5% at finish
  else if (condition >= 90)  staminaEffect = 1.0 + enduranceProgress × 0.02  // +2% at finish
  else if (condition >= 85)  staminaEffect = 1.0                             // Stable
  else if (condition >= 82)  staminaEffect = 1.0 - enduranceProgress × 0.03  // -3% at finish
  else                       staminaEffect = 1.0 - enduranceProgress × 0.10  // -10% at finish
}
```

**Stamina thresholds:**
| Condition | Category | Effect at finish (100%) | Description |
|-----------|----------|-------------------------|-------------|
| 95-100 | Elite | **+5%** | Finishing sprint |
| 90-94 | Very Good | **+2%** | Small acceleration |
| 85-89 | Good | **0%** | Stable speed |
| 82-84 | Below Average | **-3%** | Light fatigue |
| 80-81 | Low | **-10%** | Heavy fatigue |

**Influence graph:**
```
Progress:    50%  60%  70%  80%  90%  100%
Elite (95):  0%   +1%  +2%  +3%  +4%  +5%
Good (85):   0%   0%   0%   0%   0%   0%
Low (80):    0%   -2%  -4%  -6%  -8%  -10%
```

**Feature:** Non-linear influence - effect intensifies closer to finish

---

## 🔄 Speed Calculation Process

### Initialization (race start)

For each horse, the following are generated:
```typescript
dailyForm = 0.95 + random() × 0.10     // 0.95..1.05
startBurst = 0.92 + random() × 0.16    // 0.92..1.08
```

### On each tick (every 100ms)

1. **Calculate race progress:**
   ```typescript
   raceProgress = (currentDistance / totalDistance) × 100  // 0..100%
   ```

2. **Calculate factors:**
   ```typescript
   conditionFactor = 1 + ((condition - 90) / 100) × 0.15
   variation = 0.8 + random() × 0.4
   formFactor = dailyForm  // Already generated
   burstFactor = (raceProgress <= 20) ? startBurst : 1.0
   staminaEffect = calculateStaminaEffect(condition, raceProgress)
   ```

3. **Final speed:**
   ```typescript
   speed = 15 × conditionFactor × formFactor × burstFactor × variation × staminaEffect
   ```

4. **Calculate distance traveled:**
   ```typescript
   distanceDelta = speed × (100ms / 1000) = speed × 0.1
   newDistance = currentDistance + distanceDelta
   ```

---

## 📊 Calculation Examples

### Example 1: Elite horse (condition = 100)

**Race start (0%):**
```
conditionFactor = 1.015  (+1.5%)
formFactor = 1.02        (good form today)
burstFactor = 1.05       (excellent start)
variation = 1.1          (lucky variation)
staminaEffect = 1.0      (not active yet)

speed = 15 × 1.015 × 1.02 × 1.05 × 1.1 × 1.0 = 17.9 m/s
```

**Mid-race (50%):**
```
conditionFactor = 1.015
formFactor = 1.02
burstFactor = 1.0        (burst ended)
variation = 0.95
staminaEffect = 1.0      (just activated)

speed = 15 × 1.015 × 1.02 × 1.0 × 0.95 × 1.0 = 14.7 m/s
```

**Finish (100%):**
```
conditionFactor = 1.015
formFactor = 1.02
burstFactor = 1.0
variation = 1.15
staminaEffect = 1.05     (elite finishing sprint!)

speed = 15 × 1.015 × 1.02 × 1.0 × 1.15 × 1.05 = 18.6 m/s
```

---

### Example 2: Weak horse (condition = 80)

**Race start (0%):**
```
conditionFactor = 0.985  (-1.5%)
formFactor = 0.97        (bad form)
burstFactor = 0.95       (weak start)
variation = 0.85
staminaEffect = 1.0

speed = 15 × 0.985 × 0.97 × 0.95 × 0.85 × 1.0 = 11.6 m/s
```

**Finish (100%):**
```
conditionFactor = 0.985
formFactor = 0.97
burstFactor = 1.0
variation = 1.05
staminaEffect = 0.90     (heavy fatigue -10%)

speed = 15 × 0.985 × 0.97 × 1.0 × 1.05 × 0.90 = 13.8 m/s
```

---

## 🎲 Why Can a Weak Horse Win?

Thanks to high random variation (±20% on each tick) and various factor combinations:

1. **Lucky daily form** (+5%)
2. **Explosive start** (+8%)
3. **High variation** on most ticks (+20%)
4. **Bad luck for competitors** (bad form, weak start, low variation)

**Probability of weak horse winning:** ~5-15% depending on condition difference

---

## ⚙️ Balance Settings

Current settings provide:
- ✅ Condition matters but doesn't determine winner (±1.5%)
- ✅ High unpredictability (±20% variation)
- ✅ Realistic fatigue for weak horses (-10% at finish)
- ✅ Finishing sprint for strong horses (+5% at finish)
- ✅ Excitement and spectacle in races

**Changed during development:**
- Minimum stamina: 60 → **80** (removed very weak horses)
- Condition influence: 0.20 → **0.15** (reduced to compensate for stamina effect)
- Variation: ±15% → **±20%** (increased for more unpredictability)

---

**Document current as of:** February 15, 2026

