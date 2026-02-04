# Research: Workout Management System

**Date**: 2026-02-04
**Phase**: 0 - Technology Research & Decisions
**Input**: Feature spec and technical context from plan.md

## Research Tasks Completed

### 1. State Management Decision

**Question**: Which state management solution best fits offline-first workout tracking with React Native?

**Decision**: TanStack Query (React Query) v5

**Rationale**:

- **Offline-first support**: Built-in caching with persistence via AsyncStorage plugin
- **Simple API**: Aligns with constitution's simplicity principle - no boilerplate reducers/actions
- **Optimistic updates**: Perfect for workout logging (instant UI feedback, sync later)
- **Stale-while-revalidate**: Ideal for workout history (show cached data immediately)
- **DevTools**: Excellent debugging without violating no-test principle
- **Type-safe**: First-class TypeScript support matches our strict mode requirement

**Alternatives Considered**:

- Redux Toolkit: Rejected - too much boilerplate, over-engineered for offline-only app
- Zustand: Good simplicity but lacks built-in persistence/caching patterns TanStack Query provides
- Context + useReducer: Rejected - requires manual persistence logic, more code to maintain
- Jotai/Recoil: Rejected - atomic state unnecessary for this use case, adds complexity

**Implementation Notes**:

- Use `@tanstack/react-query` with `@tanstack/react-query-persist-client` + AsyncStorage adapter
- Configure staleTime: Infinity for workouts (data doesn't change without user action)
- Single QueryClient instance in app root layout

### 2. AsyncStorage Best Practices

**Question**: How to structure AsyncStorage for optimal workout retrieval and theme persistence?

**Decision**: Structured key patterns with JSON serialization

**Rationale**:

- **Key Pattern**: `workout:{id}`, `workouts:active`, `settings:theme`
- **Performance**: Individual workout keys prevent loading entire history on app start
- **Atomic updates**: Each workout is independent storage unit
- **Query integration**: Maps cleanly to TanStack Query cache keys

**Data Structure**:

```typescript
// Keys
'workouts:ids' → ['id1', 'id2', ...] // Index for history queries
'workout:active' → Workout | null // Currently running workout
'workout:{id}' → Workout // Individual completed workout
'settings:theme' → 'light' | 'dark'
'settings:notifications' → boolean
```

**Performance Optimization**:

- Store workout IDs list separately for pagination
- Lazy-load individual workouts on demand
- Use TanStack Query to cache loaded workouts in memory

### 3. Tailwind Theme System (@theme Strategy)

**Question**: How to implement dark/light themes with dark red accent using NativeWind?

**Decision**: Tailwind CSS custom theme with class-based switching

**Rationale**:

- **NativeWind 4.x**: Full Tailwind v3+ support including custom colors
- **Dark mode**: Use `dark:` prefix classes, controlled by React Context
- **Custom colors**: Define `primary` color as dark red (#8B0000 - #DC143C spectrum)

**Theme Configuration** (tailwind.config.js):

```javascript
module.exports = {
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFE5E5",
          100: "#FFB3B3",
          200: "#FF8080",
          300: "#FF4D4D",
          400: "#FF1A1A",
          500: "#DC143C", // Crimson (main dark red)
          600: "#B22222", // Firebrick
          700: "#8B0000", // Dark red
          800: "#660000",
          900: "#400000",
        },
      },
    },
  },
};
```

**Implementation**:

- Store theme preference in AsyncStorage `settings:theme`
- Theme context provider at app root (\_layout.tsx)
- Apply `dark` class to root element based on context
- All components use `bg-white dark:bg-gray-900`, `text-primary-600 dark:text-primary-400` patterns

### 4. Expo Router File-Based Routing Patterns

**Question**: How to structure routes for 2-tap workout start and navigation flow?

**Decision**: Flat route structure with dynamic segments for details

**Routes Mapping**:

```
/                           → Home (Start Workout button - tap 1)
/start-workout              → Active session (auto-navigates from home - tap 2)
/plan-workout               → Weekly planner
/history                    → Workout history list
/history/[id]               → Workout detail/edit
/settings                   → Theme and preferences
```

**Navigation Strategy**:

- Home screen: Large "Start Workout" CTA (tap 1)
- Auto-navigate to `/start-workout` (tap 2 = app launch → button tap)
- Bottom tab navigator (stack): Home, Plan, History, Settings
- Stack navigator for history detail (enables back navigation)

### 5. Timer Implementation Strategy

**Question**: How to implement accurate workout timer with pause/resume that survives app backgrounding?

**Decision**: Interval-based timer with background task support

**Rationale**:

- **Accuracy**: Use `setInterval` with 1-second precision (meets ±1 second requirement)
- **Persistence**: Store `startTime`, `pausedAt`, `accumulatedTime` in AsyncStorage
- **Recovery**: On app resume, calculate elapsed time from timestamps
- **Background**: Use `expo-background-fetch` for 3-hour notification

**Implementation Pattern**:

```typescript
// Timer state structure
{
  startTime: number,        // Unix timestamp when workout started
  pausedAt: number | null,  // Timestamp when paused (null if running)
  accumulatedTime: number,  // Total seconds accumulated before current interval
  isRunning: boolean
}

// Calculate current duration
const getCurrentDuration = () => {
  if (isRunning && !pausedAt) {
    return accumulatedTime + (Date.now() - startTime) / 1000;
  }
  return accumulatedTime;
};
```

**Background Notification**:

- Register background task to check workout duration
- Trigger local notification at 3-hour mark
- Use `expo-notifications` for cross-platform notification support

### 6. Exercise Set Entry UX Pattern

**Question**: How to implement repeating set fields for variable reps per set?

**Decision**: Dynamic form with add/remove set buttons

**UI Flow**:

1. Exercise form opens with 1 set input field (reps)
2. "+ Add Set" button adds another input field
3. Each set has (trash icon) to remove
4. Save button captures array of reps: [10, 8, 10, 12]

**Data Structure**:

```typescript
interface Exercise {
  id: string;
  muscleGroups: string[]; // Multiple allowed
  machine: string;
  sets: SetEntry[];
  order: number;
}

interface SetEntry {
  reps: number;
  order: number; // Preserve set order
}
```

**Validation**:

- Minimum 1 set required
- Reps must be positive integer
- Maximum 20 sets (reasonable gym constraint)

### 7. Predefined Lists Management

**Question**: Where to store and how to manage muscle groups and machines lists?

**Decision**: Hardcoded TypeScript constants with type safety

**Rationale**:

- **Simplicity**: No database schema needed, aligns with YAGNI
- **Type safety**: TypeScript enums/unions ensure valid selections
- **Performance**: Zero runtime lookup cost
- **Version control**: Changes tracked in git, no migration complexity

**Implementation** (consts/muscles.ts):

```typescript
export const MUSCLE_GROUPS = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "Forearms",
  "Cardio",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
```

**Machines** (consts/machines.ts):

```typescript
export const GYM_MACHINES = [
  "Barbell",
  "Dumbbell",
  "Cable Machine",
  "Smith Machine",
  "Leg Press",
  "Bench Press",
  "Squat Rack",
  "Pull-up Bar",
  "Dip Station",
  "Treadmill",
  "Rowing Machine",
  "Elliptical",
  "Bodyweight",
  "Resistance Bands",
  "Kettlebell",
] as const;

export type GymMachine = (typeof GYM_MACHINES)[number];
```

### 8. Incomplete Workout Recovery Strategy

**Question**: How to handle app force-close with active workout?

**Decision**: Auto-save to `workout:active` key on every change

**Flow**:

1. On workout start: Create workout in `workout:active`
2. On exercise add/edit: Update `workout:active` immediately
3. On timer tick: Update `accumulatedTime` every 5 seconds (balance persistence vs. performance)
4. On app launch: Check `workout:active`
   - If exists: Show modal "Resume workout?" with Resume/Discard buttons
   - Resume: Load into active session
   - Discard: Delete `workout:active` key
5. On workout stop: Move `workout:active` → `workout:{newId}`, add ID to `workouts:ids`

**State Reconciliation**:

- TanStack Query mutation: `saveActiveWorkout(workout)`
- Optimistic update: Update UI immediately
- Background: Persist to AsyncStorage
- On mount: Hydrate from AsyncStorage if exists

### 9. Performance Optimization Strategies

**Question**: How to achieve <1s history load for 100 workouts?

**Decision**: Pagination + lazy loading + in-memory cache

**Strategy**:

1. **Index-based pagination**: Store only IDs in `workouts:ids`
2. **Lazy load**: Load 20 workouts at a time (TanStack Query infinite query)
3. **Memory cache**: Keep loaded workouts in query cache
4. **Optimized rendering**: Use `FlatList` with `getItemLayout` for fixed-height items

**TanStack Query Setup**:

```typescript
const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ["workouts"],
  queryFn: ({ pageParam = 0 }) => loadWorkoutPage(pageParam, 20),
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  staleTime: Infinity, // Workouts don't change unless user edits
});
```

### 10. Multi-Muscle Group Selection UX

**Question**: What's the optimal UI for selecting multiple muscle groups?

**Decision**: Chip-based multi-select with search filter

**UI Pattern**:

- Display all muscles as chips (like tags)
- Selected chips highlighted with primary color
- Tap to toggle selection
- Search input filters available chips
- Selected count indicator "(3 selected)"

**Component**: `MuscleGroupPicker.tsx` - reusable across exercise form and planning

## Technology Stack Summary

| Component     | Technology         | Version | Rationale                               |
| ------------- | ------------------ | ------- | --------------------------------------- |
| Runtime       | React Native       | 0.81.5  | Via Expo SDK 54                         |
| Framework     | Expo               | ~54.0   | Simplifies native features, OTA updates |
| Language      | TypeScript         | 5.9+    | Type safety, better DX                  |
| Routing       | Expo Router        | ~6.0    | File-based, type-safe navigation        |
| Styling       | NativeWind         | ^4.2    | Tailwind for RN, class-based theming    |
| State         | TanStack Query     | ^5.0    | Offline-first, simple API               |
| Storage       | AsyncStorage       | -       | Built-in Expo, simple key-value         |
| Notifications | expo-notifications | -       | 3-hour workout alert                    |
| Timer         | Native JS          | -       | setInterval + timestamps                |

## Risks & Mitigations

| Risk                           | Impact                      | Mitigation                                                          |
| ------------------------------ | --------------------------- | ------------------------------------------------------------------- |
| AsyncStorage size limits (6MB) | High volume users hit limit | Monitor storage usage, implement cleanup for workouts >6 months old |
| Timer accuracy in background   | iOS suspends timers         | Store timestamps, recalculate on resume                             |
| TanStack Query learning curve  | Dev velocity                | Extensive docs, simple patterns in codebase                         |
| NativeWind SSR limitations     | Build issues                | Expo handles SSR, minimal config needed                             |
| No cloud backup                | Data loss on device reset   | Document in-app, consider future export feature                     |

## Open Questions (Deferred to Implementation)

None - all critical decisions resolved in Phase 0.

## Next Steps

Proceed to Phase 1:

- Generate data-model.md (entities and relationships)
- Create contracts/storage-api.md (AsyncStorage interface)
- Write quickstart.md (dev setup instructions)
- Update agent context with new technologies
