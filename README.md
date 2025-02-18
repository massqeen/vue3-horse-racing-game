# 🐴 Horse Racing Game

**Interactive horse racing simulation built with Vue 3, TypeScript, and Vuex 4.**

🎮 **[Play Live Demo](https://massqeen.github.io/vue3-horse-racing-game/)**

## 🎯 Features

- 🏇 **20 Unique Horses** - Each with unique name, color, and condition (80-100)
- 🏁 **6 Race Rounds** - Progressive distances: 1200m → 1400m → 1600m → 1800m → 2000m → 2200m
- 🎲 **Deterministic Simulation** - Seeded PRNG (Mulberry32) for reproducible results
- 🎯 **Smart Lane Assignment** - Stronger horses placed in middle lanes (swimming-style)
- 📊 **Real-time Animation** - Smooth progress bars with fade transitions between rounds
- 🏆 **Live Rankings** - Crown icon for current leader, position badges on finish
- 📑 **Tabbed Interface** - Separate tabs for schedule and results navigation
- 🎨 **Interactive Highlights** - Hover on horse to highlight in current race
- ⚡ **Speed Dynamics** - Start boost, fatigue, final sprint based on condition
- ✅ **Full Test Coverage** - 30 unit tests + 27 E2E tests (9 scenarios × 3 browsers)

## 🚀 Quick Start

### Prerequisites

- Node.js `>=24.13.1` (LTS)
- npm or pnpm

> **Tip:** This project includes `.nvmrc` and `.node-version` files. 
> - If you use [nvm](https://github.com/nvm-sh/nvm): `nvm use`
> - If you use [fnm](https://github.com/Schniz/fnm): `fnm use`
> - If you use [asdf](https://asdf-vm.com/): `asdf install`

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 How to Play

1. **Click "Generate"** - Creates 20 horses with random conditions and generates 6 race rounds
2. **Review Schedule** - Use tabs to see which horses compete in each round
3. **Click "Start Round"** - Begins the current race (races run one at a time)
4. **Watch the race** - Horses animate across the track with dynamic speed
5. **View results** - After each round, results appear in a new tab
6. **Continue racing** - Click "Start Round" for the next race until all 6 rounds complete
7. **Click "Reset Game"** - Clears all data and returns to initial state
8. **Generate again** - After reset, click "Generate" to start a new game with different horses

## 📏 Race Rules

### Horse Generation
- **Total Horses**: 20 (fixed)
- **Unique Colors**: Each horse has a distinct color
- **Condition Range**: 80-100 (represents fitness/stamina)
- **Unique Names**: Mythological and powerful names

### Race Schedule
- **Total Rounds**: 6
- **Horses per Round**: 10 (randomly selected from 20)
- **Round Distances**:
  - Round 1: 1200m
  - Round 2: 1400m
  - Round 3: 1600m
  - Round 4: 1800m
  - Round 5: 2000m
  - Round 6: 2200m

### Lane Assignment
- Horses sorted by condition (descending)
- Strongest horses → middle lanes (lanes 5-6)
- Weakest horses → outer lanes (lanes 1, 10)
- Mimics real swimming/track competition strategy

### Speed Calculation
Each horse's speed is influenced by:
1. **Base Condition** - Higher condition = faster base speed
2. **Start Boost** - 15% speed increase for first 5% of race
3. **Fatigue** - Gradual slowdown as distance increases
4. **Final Sprint** - 10% boost in last 10% (only if condition ≥ 85)
5. **Random Variation** - ±10% randomness for unpredictability

## 🏗️ Architecture

### Project Structure

```
src/
├── domain/              # Business logic (framework-agnostic)
│   ├── types.ts        # TypeScript interfaces (Horse, Round, RoundResult, AppPhase)
│   ├── constants.ts    # Game constants (HORSES_TOTAL = 20, ROUNDS_TOTAL = 6)
│   ├── rng.ts          # Seeded PRNG (mulberry32) for deterministic generation
│   ├── generation.ts   # generateHorses(), generateSchedule() logic
│   └── simulation.ts   # Race engine: speed calculation, progress tracking, finish logic
├── store/              # Vuex 4 state management (namespaced modules)
│   ├── index.ts        # Root store configuration
│   └── modules/
│       ├── horses.ts   # State: 20 horses with color & condition
│       ├── race.ts     # State: schedule, current round, results, race execution
│       └── ui.ts       # State: phase transitions (idle → generated → running → finished)
├── components/         # Vue 3 components (Composition API)
│   ├── HorsesList.vue      # Display all horses, highlight active ones
│   ├── ScheduleView.vue    # Show 6 rounds with participants (tabbed interface)
│   ├── CurrentRound.vue    # Animated race visualization with progress bars
│   ├── ResultsBoard.vue    # Results for each completed round (tabbed)
│   └── ControlsPanel.vue   # Generate/Start/Reset buttons with phase control
└── views/
    └── GameView.vue    # Main view assembling all components
```

### Domain Layer

**`rng.ts`** - Seeded PRNG (Mulberry32)
- Deterministic random number generation
- Same seed → same results
- `Math.random()` is **forbidden** in domain logic

**`generation.ts`** - Horse & Schedule Generation
- `generateHorses()`: Creates 20 horses with unique colors and random condition (80-100)
- `generateSchedule()`: Creates 6 rounds with 10 random horses each
- Lane assignment: stronger horses get middle lanes (like swimming)

**`simulation.ts`** - Race Simulation Engine
- Calculates horse speed based on:
  - **Condition factor**: Higher condition = faster base speed
  - **Start boost**: 15% boost for first 5% of distance
  - **Fatigue**: Gradually increases over distance
  - **Final sprint**: 10% boost for last 10% of distance (condition-dependent)
  - **Random variation**: Adds unpredictability
- Tracks progress until finish line (distance = 100%)
- Determines exact finish times and rankings

**`types.ts`** - TypeScript Definitions
- `Horse`: id, name, color, condition
- `Round`: roundNumber, distance, horses (with lane assignments)
- `RoundResult`: rankings, times, metadata
- `AppPhase`: 'idle' | 'generated' | 'running' | 'finished'

**`constants.ts`** - Game Configuration
- `HORSES_TOTAL = 20`
- `ROUNDS_TOTAL = 6`
- `HORSES_PER_ROUND = 10`
- Speed factors, simulation timing, distance progression

### State Management (Vuex 4)

**Modular Architecture:**
- ✅ Namespaced modules
- ✅ Strongly typed `RootState`
- ✅ No direct state mutations
- ✅ All business logic in domain layer

**Phase Transitions:**
```
idle → [Generate] → generated → [Start] → running → [Finish] → finished → [Reset] → idle
```

**Store Modules:**
- `horses`: Manages 20 horses, triggers generation
- `race`: Manages schedule, executes races, stores results
- `ui`: Controls phase, prevents invalid state transitions

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes type-check, lint, unit tests) |
| `npm run preview` | Preview production build |
| `npm run test:unit` | Run unit tests (Vitest) |
| `npm run test:e2e` | Run E2E tests (Playwright on 3 browsers) |
| `npm run test:all` | Run all tests (unit + E2E) |
| `npm run pre-merge` | Full verification before merging (type-check + lint + all tests) |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | Lint and fix code |
| `npm run format` | Format code with Prettier |

## 🧪 Testing

### Unit Tests (30 tests)

```sh
npm run test:unit
```

**Coverage:**
- **rng.spec.ts** (8 tests) - Seeded PRNG determinism and reproducibility
- **generation.spec.ts** (12 tests) - Horse & schedule generation logic
- **simulation.spec.ts** (8 tests) - Race simulation engine and speed calculations
- **App.spec.ts** (2 tests) - Component integration tests

All unit tests run in ~2 seconds.

### E2E Tests (27 tests = 9 scenarios × 3 browsers)

```sh
# Install browsers first (one-time)
npx playwright install

# Run E2E tests
npm run test:e2e
```

**Test Coverage:**
- ✅ Interface loading and initial state
- ✅ Horse generation (20 horses with valid conditions 80-100)
- ✅ Schedule generation (6 rounds with 10 horses each)
- ✅ Round distances verification (1200m → 2200m progression)
- ✅ Full race sequence (all 6 rounds automatically)
- ✅ Results display with rankings and times
- ✅ Medal display (🥇🥈🥉) for podium positions
- ✅ Reset button functionality (clears game state and re-enables Generate)

**Browsers:** Chromium, Firefox, WebKit

**Performance:** All 27 E2E tests complete in ~1.5 minutes thanks to 200x simulation acceleration in test mode.

> **Note:** E2E tests use accelerated simulation (200x faster) for quick execution. Production uses realistic speeds.

### Running All Tests

```sh
# Run unit tests + E2E tests
npm run test:all

# Full pre-merge check (type-check + lint + all tests)
npm run pre-merge
```

**Recommended workflow:**
- During development: `npm run build` (fast, includes unit tests)
- Before PR/merge: `npm run pre-merge` (comprehensive check)
- CI/CD pipeline: `npm run pre-merge`

## 🛠️ Tech Stack

- **Framework:** Vue 3.5 (Composition API)
- **Language:** TypeScript 5.9 (strict mode)
- **State Management:** Vuex 4.1
- **Build Tool:** Vite 7.3
- **Testing:** Vitest 4.0 + Playwright 1.58
- **Code Quality:** ESLint 9 + Prettier 3.8

## 🔒 Technical Constraints

**Mandatory Stack:**
- ✅ Vue 3 + TypeScript + Vuex 4 (strict mode)
- ✅ Modular Vuex architecture (namespaced modules)
- ✅ Deterministic generation via seeded PRNG

**Forbidden:**
- ❌ No UI libraries (pure CSS with CSS variables)
- ❌ No canvas/WebGL for animations
- ❌ No Pinia or other state managers
- ❌ No `Math.random()` in domain logic
- ❌ No `any` type in TypeScript

**Architecture Principles:**
- Business logic strictly in `src/domain/` layer
- No business logic in Vue components
- Race completion determined by logic, not CSS animations
- Component-based design with clear separation of concerns

## 🎨 Key Technical Decisions

### Seeded PRNG (Mulberry32)
- Ensures deterministic, reproducible race results
- No `Math.random()` in domain logic
- Same seed = same race outcomes

### Condition-Based Speed
Horses with higher condition (80-100) run faster with multiple factors:
```typescript
speed = BASE_SPEED * conditionFactor * variation * fatigueFactor * boostFactor
conditionFactor = 1 + ((condition - 50) / 100) * 0.5
```

**Speed Modifiers:**
- **Start Boost**: 15% faster in first 5% of race
- **Fatigue**: Gradually slows horse over distance
- **Final Sprint**: 10% boost in last 10% (if condition ≥ 85)
- **Random Variation**: ±10% for unpredictability

### Strict Vuex Architecture
- All mutations through mutation handlers
- No direct state modification (enforced via guards)
- Namespaced modules for clarity
- Strongly typed `RootState` interface

### Domain-Driven Design
- Business logic isolated in `src/domain/`
- Framework-agnostic core
- Easy to test and maintain
- Clear separation: domain → store → components

## 📝 Development Notes

### IDE Setup

**Recommended:** [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Browser DevTools

- **Chrome/Edge:** [Vue.js DevTools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox:** [Vue.js DevTools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### Type Support

TypeScript integration via `vue-tsc`. The `tsc` CLI is replaced with `vue-tsc` for proper `.vue` file type checking.

## 📊 Bundle Stats

- **Total Size:** ~114 kB (HTML + CSS + JS)
- **CSS:** 20.17 kB (gzipped: 3.91 kB)
- **JS:** 93.71 kB (gzipped: 34.72 kB)
- **Build time:** ~600ms

## 📚 Documentation

- [SPEED_CALCULATION_DETAILED.md](SPEED_CALCULATION_DETAILED.md) - Detailed speed mechanics and calculation formulas
- [EFFECTS_TIMELINE.md](EFFECTS_TIMELINE.md) - Speed modifiers timeline table (start boost, fatigue, final sprint)
- [Vite Config Reference](https://vite.dev/config/)

## 🐛 Known Issues

None. All features implemented and tested.

## 📄 License

This project is for educational purposes (trial day assignment).

---

**Built with ❤️ using Vue 3 + TypeScript + Vuex**
