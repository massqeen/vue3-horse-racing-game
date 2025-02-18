# Race Effects Timeline

## Question: How long does each effect last? (% of track length)

---

## 📊 Effects Table by Distance

| Race Progress | Daily Form | Start Burst | Stamina Effect (Elite 95-100) | Stamina Effect (Low 80-81) | Dominant Factor |
|----------------|------------|-------------|-------------------------------|----------------------------|---------------------|
| **0%** (start) | ✅ 100% active | ⚡ 100% active | ❌ 0% (not active) | ❌ 0% (not active) | Random ±20% + Burst + Form |
| **10%** | ✅ 100% active | ⚡ 100% active | ❌ 0% | ❌ 0% | Random ±20% + Burst + Form |
| **20%** | ✅ 100% active | ⚡ 100% active | ❌ 0% | ❌ 0% | Random ±20% + Burst + Form |
| **25%** | ✅ 100% active | ❌ 0% (ended) | ❌ 0% | ❌ 0% | Random ±20% + Form |
| **40%** | ✅ 100% active | ❌ 0% | ❌ 0% | ❌ 0% | Random ±20% + Form |
| **50%** (middle) | ✅ 100% active | ❌ 0% | ⚡ 0% (starts) | 🐌 0% (starts) | Random ±20% + Form |
| **60%** | ✅ 100% active | ❌ 0% | ⚡ +1% | 🐌 -2% | Form + Stamina begins |
| **70%** | ✅ 100% active | ❌ 0% | ⚡ +2% | 🐌 -4% | Stamina intensifies |
| **75%** | ✅ 100% active | ❌ 0% | ⚡ +2.5% | 🐌 -5% | Stamina more important |
| **80%** | ✅ 100% active | ❌ 0% | ⚡ +3% | 🐌 -6% | Stamina dominates |
| **90%** | ✅ 100% active | ❌ 0% | ⚡ +4% | 🐌 -8% | Stamina maximum |
| **95%** | ✅ 100% active | ❌ 0% | ⚡ +4.5% | 🐌 -9% | Finishing sprint! |
| **100%** (finish) | ✅ 100% active | ❌ 0% | ⚡ +5% | 🐌 -10% | Stamina peak! |

---

## 📈 Detailed Effect Breakdown

### 1. Daily Form (±5%) - "Form of the Day"

**When active:** `0% → 100%` of distance  
**Duration:** **ENTIRE RACE** (100% of track)  
**Value:** Fixed (does not change)

```
Progress:  0%    25%    50%    75%    100%
           |      |      |      |      |
Form:      ████████████████████████████  100% active
           ↑
           Generated once at start
           Represents "lucky/unlucky day"
```

**What it is:**
- How much the horse is "in form" today
- Applied throughout the entire race
- Range: 0.95 - 1.05 (±5%)

**Example:**
- Horse received form = 1.03 (+3%)
- This +3% is applied **on every tick** from 0% to 100%
- Never changes during the race

---

### 2. Start Burst (±8%) - "Starting Sprint"

**When active:** `0% → 20%` of distance  
**When ends:** `20%` of distance  
**Duration:** **20% of track** (start only)  
**Value:** Fixed (does not change while active)

```
Progress:  0%    25%    50%    75%    100%
           |      |      |      |      |
Burst:     ████████▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  20% active
           ↑       ↑
           Start   Ended (20%)
```

**What it is:**
- How successfully the horse started
- "Shot forward" or "got stuck" at start
- Applied only in first 20% of distance
- Range: 0.92 - 1.08 (±8%)

**Example:**
- Horse received burst = 1.06 (+6%)
- At 0-20%: speed × 1.06 (fast start!)
- After 20%: burst deactivates
- Allows taking a good position at the beginning

---

### 3. Stamina Effect - Elite (condition 95-100)

**When starts:** `50%` of distance  
**When reaches maximum:** `100%` of distance  
**Active phase duration:** **50% of track** (second half)

```
Progress:  0%    25%    50%    75%    100%
           |      |      |      |      |
Effect:    ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬/▬▬▬▬/▬▬▬▬/  
           0%           +1%   +2.5% +5%
           
           ← No effect →  ← Linear growth →
           (50% track)        (50% track)
```

**Growth formula:**
```typescript
if (progress < 50%) {
  effect = 0%
} else {
  enduranceProgress = (progress - 50) / 50  // 0.0 → 1.0
  effect = enduranceProgress × 5%           // 0% → 5%
}
```

**Examples:**
- At 50%: `(50-50)/50 × 5% = 0%`
- At 60%: `(60-50)/50 × 5% = 1%`
- At 75%: `(75-50)/50 × 5% = 2.5%`
- At 100%: `(100-50)/50 × 5% = 5%`

---

### 3. Stamina Effect - Low (condition 80-81)

**When starts:** `50%` of distance  
**When reaches maximum:** `100%` of distance  
**Active phase duration:** **50% of track** (second half)

```
Progress:  0%    25%    50%    75%    100%
           |      |      |      |      |
Effect:    ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\▬▬▬▬\▬▬▬▬\  
           0%           -2%   -5%  -10%
           
           ← No effect →  ← Linear decline →
           (50% track)        (50% track)
```

**Growth formula:**
```typescript
if (progress < 50%) {
  effect = 0%
} else {
  enduranceProgress = (progress - 50) / 50  // 0.0 → 1.0
  effect = -enduranceProgress × 10%         // 0% → -10%
}
```

**Examples:**
- At 50%: `-(50-50)/50 × 10% = 0%`
- At 60%: `-(60-50)/50 × 10% = -2%`
- At 75%: `-(75-50)/50 × 10% = -5%`
- At 100%: `-(100-50)/50 × 10% = -10%`

---

## 🎯 Visualization of All Effects Together

### Elite horse (condition=100, form=1.03, burst=1.06)

```
Effect
  ^
  |  Total = Form × Burst × Stamina
  |
8%|  ████████▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  Burst +6% (0-20%)
  |  ██████████████████████████  Form +3% (entire race)
  |                   /▬▬▬▬▬▬▬▬▬▬▬▬/  +Stamina 0→5% (50-100%)
  |                  /
0%|  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  |
  +------|------|------|------|-------> Progress
       0%    20%    50%    75%   100%
       
Total: 
0-20%:  +3% (form) + 6% (burst) = +9%
20-50%: +3% (form only)
50-100%: +3% (form) + 0→5% (stamina) = +3→8%
```

### Low horse (condition=80, form=0.97, burst=0.94)

```
Effect
  ^
0%|  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
  |  ██████████████████████████  Form -3% (entire race)
-6%|  ████████▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  Burst -6% (0-20%)
  |                   \▬▬▬▬▬▬▬▬▬▬▬▬\  -Stamina 0→-10% (50-100%)
  |                                 \
-13%|
  +------|------|------|------|-------> Progress
       0%    20%    50%    75%   100%
       
Total:
0-20%:  -3% (form) -6% (burst) = -9%
20-50%: -3% (form only)
50-100%: -3% (form) + 0→-10% (stamina) = -3→-13%
```

---

## 📊 Summary Table by Track Percentage

### Elite (condition=100, boost=1.08)

| % track | Boost | Stamina | Total | Description |
|----------|-------|---------|-------|----------|
| 0-50% | +8% | 0% | **+8%** | Stable advantage |
| 50% | +8% | 0% | **+8%** | Endurance zone starts |
| 60% | +8% | +1% | **+9.08%** | Light acceleration |
| 70% | +8% | +2% | **+10.16%** | Acceleration grows |
| 75% | +8% | +2.5% | **+10.7%** | Home stretch |
| 80% | +8% | +3% | **+11.24%** | Sprint intensifies |
| 90% | +8% | +4% | **+12.32%** | Powerful finish |
| 100% | +8% | +5% | **+13.4%** | Maximum! 🚀 |

### Low (condition=80, boost=0.92)

| % track | Boost | Stamina | Total | Description |
|----------|-------|---------|-------|----------|
| 0-50% | -8% | 0% | **-8%** | Stable disadvantage |
| 50% | -8% | 0% | **-8%** | Endurance zone starts |
| 60% | -8% | -2% | **-9.84%** | Starts getting tired |
| 70% | -8% | -4% | **-11.68%** | Fatigue grows |
| 75% | -8% | -5% | **-12.6%** | Heavy fatigue |
| 80% | -8% | -6% | **-13.52%** | Exhaustion |
| 90% | -8% | -8% | **-15.36%** | Heavy exhaustion |
| 100% | -8% | -10% | **-17.2%** | Completely exhausted 🐌 |

---

## 🔑 Key Points

### Daily Form:
- ✅ **Active:** 0-100% (entire race)
- ✅ **Duration:** 100% of track
- ✅ **Character:** Constant (does not change)
- ✅ **Range:** from -5% to +5%
- 🎯 **Meaning:** How much the horse is "in form" today

### Start Burst:
- ⚡ **Active:** 0-20% (start only)
- ⚡ **Duration:** 20% of track
- ⚡ **Character:** Constant while active, then deactivates
- ⚡ **Range:** from -8% to +8%
- 🎯 **Meaning:** How successfully the horse started

### Stamina Effect:
- ⏱️ **Inactive:** 0-50% (first half)
- ⚡ **Active:** 50-100% (second half)
- 📈 **Duration:** 50% of track
- 📊 **Character:** Linearly grows from 0% to max
- 🎯 **Range:** from -10% to +5% (depends on condition)

### Critical Points:

| Point | % track | What happens |
|-------|----------|----------------|
| **Start** | 0% | Form + Burst active |
| **20%** | 20% | **Burst ends** - only Form remains |
| **50%** | **50%** | ⚡ **Stamina starts working!** |
| **75%** | 75% | Stamina already noticeable (±2.5-5%) |
| **100%** | 100% | Stamina maximum (±5-10%) |

---

## 💡 Practical Example: 1200m race

### Real distances:

| % | Meters | Form | Burst | Stamina (Elite) | Stamina (Low) | Phase |
|---|-------|------|-------|-----------------|---------------|------|
| 0% | 0m | +3% | +6% | 0% | 0% | Start |
| 10% | 120m | +3% | +6% | 0% | 0% | Beginning |
| 20% | 240m | +3% | +6% | 0% | 0% | Burst ends |
| 25% | 300m | +3% | 0% | 0% | 0% | Quarter |
| 50% | **600m** | +3% | 0% | **0%** | **0%** | **Middle - turning point** |
| 60% | 720m | +3% | 0% | +1% | -2% | Endurance manifests |
| 75% | 900m | +3% | 0% | +2.5% | -5% | Home stretch |
| 90% | 1080m | +3% | 0% | +4% | -8% | Last meters |
| 100% | 1200m | +3% | 0% | +5% | -10% | Finish! |

**Conclusion:**
- **First 240 meters (20%):** Form + Burst - fast start!
- **240-600 meters (20-50%):** Only Form - stable phase
- **Last 600 meters (50-100%):** Form + Stamina - endurance decides!

---

## 🎮 Game Meaning

### Why this division?

1. **0-20% (starting phase):**
   - Creates **start drama** - who started better?
   - Form + Burst active
   - Important to take good position
   - **"Who shot off the start?"**

2. **20-50% (middle phase):**
   - **Stabilization** - burst ended
   - Only Form + Random
   - Can rest and prepare
   - **"Calm middle"**

3. **50-100% (finishing phase):**
   - **Drama** builds
   - Elite horses start accelerating (stamina)
   - Weak ones start falling behind
   - **"Endurance decides!"**

4. **90-100% (climax):**
   - **Finishing sprint**
   - Stamina effect maximum
   - Overtakes visible
   - **"Who reaches finish first?"**

---

## Answer to the question:

### Daily Form (Form of the Day):
**Active:** 0% → 100% of track (**100% of length**)  
**Character:** Constant throughout entire race  
**Range:** ±5%  
**Meaning:** How much the horse is "in form" today

### Start Burst (Starting Sprint):
**Active:** 0% → 20% of track (**20% of length**)  
**Character:** Constant while active, then deactivates  
**Range:** ±8%  
**Meaning:** How successfully the horse started

### Stamina Effect (acceleration/deceleration):
**Starts:** 50% of track  
**Active until:** 100% of track  
**Duration:** **50% of track length**  
**Character:** Linearly grows from 0% to maximum

**In meters for 1200m race:**
- Daily Form: **0m → 1200m** (entire distance)
- Start Burst: **0m → 240m** (first fifth)
- Stamina Effect: **600m → 1200m** (second half)

