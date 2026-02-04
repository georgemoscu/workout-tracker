# Implementation Plan: Workout Management System

**Branch**: `001-workout-management` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-workout-management/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a mobile workout tracker app enabling users to start workouts in 2 taps, log exercises with muscle groups/machines/sets/reps, and review workout history. The app uses Expo with React Native, file-based routing via Expo Router, Tailwind CSS for theming (dark/light with dark red accents), and AsyncStorage for local-first data persistence. State management via TanStack Query (React Query) for data synchronization. Architecture follows clean, page-based structure with one component per file per constitution principles (readability, maintainability, simplicity).

## Technical Context

**Language/Version**: TypeScript 5.9+ (strict mode enabled)
**Primary Dependencies**: Expo SDK ~54.0, React Native 0.81.5, Expo Router ~6.0, NativeWind ^4.2, TanStack Query (React Query) ^5.0, AsyncStorage
**Storage**: AsyncStorage (local device storage, offline-first)
**Testing**: None (per constitution: no unit tests, manual testing only)
**Target Platform**: iOS 15+ and Android 10+ (via Expo)
**Project Type**: Mobile (React Native/Expo single-platform codebase)
**Performance Goals**: App launch <2 seconds, 60 FPS UI, timer accuracy ±1 second over 2 hours, history load <1 second for 100 workouts
**Constraints**: Offline-capable (no network required), local storage only, theme switch <100ms, workout start in 2 taps max, notification after 3 hours active workout
**Scale/Scope**: Single user per device, ~10-15 screens, unlimited workout history (storage limited by device), predefined muscle/machine lists

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Readability First

- ✅ **PASS**: Descriptive naming enforced (component names, hooks, functions)
- ✅ **PASS**: Single responsibility per component (<200 lines per file)
- ✅ **PASS**: One component per file architecture
- ✅ **PASS**: TypeScript interfaces for prop types ensure self-documenting code

### Principle II: Maintainability & Simplicity

- ✅ **PASS**: YAGNI applied - no premature optimization, building only P1-P5 features
- ✅ **PASS**: Minimal dependencies (Expo, TanStack Query, NativeWind only)
- ✅ **PASS**: Shallow component hierarchy (page-based architecture)
- ✅ **PASS**: TanStack Query for straightforward, predictable state management
- ✅ **PASS**: Reuse patterns (shared exercise form, workout card components)

### Principle III: No Unit Testing

- ✅ **PASS**: No test files planned
- ✅ **PASS**: Manual device testing strategy
- ✅ **PASS**: User acceptance focused quality gates

### Technology Stack Compliance

- ✅ **PASS**: Expo + React Native as required
- ✅ **PASS**: Tailwind CSS via NativeWind for styling
- ✅ **PASS**: TypeScript strict mode enabled
- ✅ **PASS**: Expo Router for file-based routing
- ✅ **PASS**: AsyncStorage for local persistence

### Development Standards Compliance

- ✅ **PASS**: File-based routing in `app/` directory
- ✅ **PASS**: Reusable components in `components/` directory
- ✅ **PASS**: Constants in `consts/` directory (muscle groups, machines)
- ✅ **PASS**: Functional components with hooks only
- ✅ **PASS**: State management via hooks + TanStack Query

**Constitution Gate Status**: ✅ **PASSED** - All principles satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/001-workout-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── storage-api.md   # AsyncStorage interface contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── _layout.tsx                 # Root layout with theme provider
├── index.tsx                   # Home screen - workout start (2-tap requirement)
├── start-workout.tsx           # Active workout session screen
├── plan-workout.tsx            # Weekly workout planning screen
├── history/
│   ├── index.tsx              # Workout history list
│   └── [id].tsx               # Workout detail/edit screen
└── settings/
    └── index.tsx              # Theme and app settings

components/
├── ExerciseForm.tsx           # Exercise input form (muscle, machine, sets, reps)
├── ExerciseListItem.tsx       # Display single exercise in workout
├── WorkoutCard.tsx            # Workout summary card for history
├── WorkoutTimer.tsx           # Timer component with pause/resume/stop
├── MuscleGroupPicker.tsx      # Multi-select muscle group picker
├── MachinePicker.tsx          # Machine/equipment selector
├── SetInput.tsx               # Individual set entry (reps input)
└── ThemeToggle.tsx            # Dark/light theme switcher

lib/
├── storage/
│   ├── workoutStorage.ts      # Workout CRUD operations with AsyncStorage
│   ├── settingsStorage.ts     # Theme and settings persistence
│   └── types.ts               # TypeScript types for storage data
├── hooks/
│   ├── useWorkouts.ts         # TanStack Query hook for workouts
│   ├── useActiveWorkout.ts    # Active workout session state management
│   ├── useTheme.ts            # Theme context hook
│   └── useNotification.ts     # 3-hour workout notification
└── utils/
    ├── timerUtils.ts          # Timer calculation utilities
    └── dateUtils.ts           # Date formatting utilities

consts/
├── muscles.ts                 # Predefined muscle groups list
├── machines.ts                # Predefined gym machines/equipment list
└── theme.ts                   # Tailwind theme config (dark red accents)

assets/
├── css/
│   └── globals.css           # Global Tailwind styles
└── images/                   # App icons and assets

types/
└── index.ts                  # Global TypeScript type definitions
```

**Structure Decision**: Mobile single-project structure (Option 3 variant). Expo React Native app with file-based routing in `app/`, shared components in `components/`, business logic in `lib/`, and constants in `consts/`. This matches the existing project structure and Expo conventions. No backend/API needed as this is offline-first with local storage only.

---

## Phase 0: Research & Technology Decisions

**Status**: ✅ Complete
**Output**: [research.md](research.md)

### Key Decisions Made

1. **State Management**: TanStack Query (React Query) v5 with AsyncStorage persistence
2. **Data Structure**: Structured AsyncStorage keys with JSON serialization
3. **Theme System**: Tailwind CSS custom colors with class-based dark mode
4. **Routing**: Expo Router file-based with flat structure
5. **Timer**: Interval-based with timestamp persistence for background survival
6. **Exercise Sets**: Dynamic form with add/remove set buttons
7. **Predefined Lists**: Hardcoded TypeScript constants (muscles, machines)
8. **Recovery**: Auto-save to `workout:active` on every change
9. **Performance**: Pagination + lazy loading + in-memory cache
10. **Multi-Select UX**: Chip-based muscle group picker

**All unknowns resolved** - See [research.md](research.md) for full rationale and alternatives considered.

---

## Phase 1: Design & Contracts

**Status**: ✅ Complete
**Outputs**:

- [data-model.md](data-model.md) - Entity definitions and relationships
- [contracts/storage-api.md](contracts/storage-api.md) - AsyncStorage interface
- [quickstart.md](quickstart.md) - Developer setup guide
- `.github/agents/copilot-instructions.md` - Updated agent context

### Data Model Summary

**Core Entities**:

- **Workout**: Training session with timer (startTime, endTime, pausedAt, accumulatedTime, status, exercises[])
- **Exercise**: Single exercise with muscle groups[], machine, sets[]
- **SetEntry**: Individual set (reps, order)
- **WorkoutPlan**: Template for planned workouts (dayOfWeek, plannedExercises[])
- **PlannedExercise**: Template exercise (muscleGroups[], machine, targetSets, targetReps)
- **UserSettings**: Theme and preferences (theme, notifications)

**Storage Keys**:

- `workout:active` - Currently running workout
- `workout:{id}` - Completed workouts
- `workouts:ids` - Workout ID index (newest first)
- `plan:{id}` - Workout plans
- `plans:byDay:{day}` - Plan index by day of week
- `settings:preferences` - User settings

**Validation Rules** documented in [data-model.md](data-model.md)

### API Contracts

**Workout Operations** (14 functions):

- Active workout: get, save, complete, delete
- Workout CRUD: getById, update, getIds (paginated), count
- Plans: save, getByDay, getById, delete
- Settings: get, save

**Performance Targets**: All operations <200ms, most <100ms

Full contract specifications in [contracts/storage-api.md](contracts/storage-api.md)

---

## Post-Design Constitution Re-check

_Required after Phase 1 design completion_

### Principle I: Readability First

- ✅ **PASS**: Component structure follows single-responsibility
- ✅ **PASS**: TypeScript interfaces self-document data structures
- ✅ **PASS**: Storage API uses descriptive function names
- ✅ **PASS**: Clear separation: screens (app/), components, logic (lib/)

### Principle II: Maintainability & Simplicity

- ✅ **PASS**: No over-engineering detected in data model
- ✅ **PASS**: Simple key-value storage (no complex queries)
- ✅ **PASS**: Embedded relationships (no joins or foreign keys)
- ✅ **PASS**: TanStack Query reduces boilerplate significantly

### Principle III: No Unit Testing

- ✅ **PASS**: Manual testing checklist provided in quickstart.md
- ✅ **PASS**: No test files created
- ✅ **PASS**: No test frameworks added to dependencies

### Final Gate Status: ✅ **PASSED**

Design maintains all constitutional principles. Ready for implementation (Phase 2: Tasks).

---

## Implementation Readiness Checklist

- [x] Technical Context fully specified
- [x] Constitution compliance verified (pre and post design)
- [x] All research questions resolved
- [x] Data model complete with validation rules
- [x] Storage API contract documented
- [x] Developer quickstart guide created
- [x] Agent context updated with new technologies
- [x] Project structure defined and mapped
- [x] Performance requirements specified
- [x] Error handling strategy documented

**Next Command**: `/speckit.tasks` to generate implementation task list

---

## Notes for Implementation

### Critical Path (P1-P2 First)

1. **P1: Quick Workout Start** - Highest priority, enables MVP
   - Home screen with "Start Workout" button
   - Active workout screen with timer
   - AsyncStorage setup for `workout:active`
2. **P2: Exercise Logging** - Second priority, adds substance
   - Exercise form component
   - Muscle group multi-select picker
   - Machine picker
   - Dynamic set entry form
   - Save to workout exercises array

3. **P3: History & Editing** - Third priority, completes core loop
4. **P4: Workout Planning** - Enhancement for advanced users
5. **P5: Theme Customization** - Polish feature

### Development Environment

**Existing Setup** (already in project):

- ✅ Expo SDK 54
- ✅ React Native 0.81.5
- ✅ TypeScript configured
- ✅ Tailwind config exists
- ✅ NativeWind installed
- ✅ Expo Router configured

**To Add** (new dependencies):

- TanStack Query (`@tanstack/react-query`)
- TanStack Query Persist (`@tanstack/react-query-persist-client`)
- AsyncStorage (`@react-native-async-storage/async-storage`)
- Expo Notifications (`expo-notifications`)

### File Creation Order

1. **Constants**: `consts/muscles.ts`, `consts/machines.ts`
2. **Types**: `lib/storage/types.ts`
3. **Storage**: `lib/storage/workoutStorage.ts`, `settingsStorage.ts`
4. **Hooks**: `lib/hooks/useWorkouts.ts`, `useActiveWorkout.ts`, `useTheme.ts`
5. **Components**: Timer, pickers, forms (reusable)
6. **Screens**: Home, active workout, history, settings

### Testing Focus Areas

- 2-tap requirement (home → start workout)
- Timer accuracy during pause/resume
- Force-close recovery flow
- Theme persistence across sessions
- Multi-muscle group selection UX
- History pagination performance (100 workouts)

---

**Plan Version**: 1.0.0
**Status**: Complete ✅
**Branch**: 001-workout-management
**Next Phase**: Tasks (via `/speckit.tasks` command)
