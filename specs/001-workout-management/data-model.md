# Data Model: Workout Management System

**Date**: 2026-02-04
**Phase**: 1 - Data Design
**Input**: Feature spec requirements and research decisions

## Core Entities

### Workout

Represents a single training session with timer tracking and exercise collection.

**Attributes**:

- `id`: string (UUID) - Unique identifier
- `startTime`: number (Unix timestamp) - When workout began
- `endTime`: number | null (Unix timestamp) - When workout stopped (null if in progress)
- `pausedAt`: number | null (Unix timestamp) - Current pause timestamp (null if running/stopped)
- `accumulatedTime`: number (seconds) - Total workout duration excluding pauses
- `status`: 'in-progress' | 'completed' | 'incomplete' - Completion state
- `exercises`: Exercise[] - Ordered list of exercises performed
- `createdAt`: number (Unix timestamp) - Record creation time
- `updatedAt`: number (Unix timestamp) - Last modification time

**Business Rules**:

- Only one workout can have status 'in-progress' at any time (enforced at storage layer)
- `accumulatedTime` must be recalculated on resume from `startTime` and `pausedAt`
- `endTime` set only when status transitions to 'completed'
- Status 'incomplete' indicates force-close recovery (no `endTime`)

**Storage Key**:

- Active: `workout:active` (single instance)
- Completed: `workout:{id}` (individual records)

**Relationships**:

- **Has Many**: Exercise (one-to-many, embedded array)

---

### Exercise

Represents a single exercise performed during a workout with set/rep tracking.

**Attributes**:

- `id`: string (UUID) - Unique identifier within workout
- `muscleGroups`: MuscleGroup[] - Target muscles (1+ selections)
- `machine`: GymMachine - Equipment used
- `sets`: SetEntry[] - Ordered list of sets performed
- `order`: number - Position in workout (0-indexed)
- `createdAt`: number (Unix timestamp) - When added to workout
- `notes`: string | null - Optional user notes

**Business Rules**:

- Must have at least 1 muscle group selected
- Must have at least 1 set entry
- Maximum 20 sets per exercise (UI constraint)
- `order` determines display sequence in workout

**Relationships**:

- **Belongs To**: Workout (parent entity)
- **Has Many**: SetEntry (one-to-many, embedded array)

---

### SetEntry

Represents a single set within an exercise.

**Attributes**:

- `id`: string (UUID) - Unique identifier within exercise
- `reps`: number - Repetitions completed (positive integer)
- `order`: number - Set number (0-indexed, e.g., Set 1 = order 0)
- `weight`: number | null - Optional weight in kg (future enhancement, null for MVP)

**Business Rules**:

- `reps` must be > 0
- `order` determines display as "Set 1, Set 2, Set 3..."
- Sets ordered sequentially within parent exercise

**Relationships**:

- **Belongs To**: Exercise (parent entity)

---

### WorkoutPlan

Template for planned workouts assigned to specific days.

**Attributes**:

- `id`: string (UUID) - Unique identifier
- `dayOfWeek`: 0-6 (number) - Sunday=0, Monday=1, ..., Saturday=6
- `name`: string - User-defined plan name (e.g., "Leg Day")
- `plannedExercises`: PlannedExercise[] - Template exercises
- `createdAt`: number (Unix timestamp) - When plan created
- `updatedAt`: number (Unix timestamp) - Last modification

**Business Rules**:

- Multiple plans can exist for same `dayOfWeek` (allows variations)
- Plan acts as template only, doesn't track completion
- When started, plan data copied to active Workout (not linked)

**Storage Key**: `plan:{id}` (individual records)
**Index Key**: `plans:byDay:{dayOfWeek}` → array of plan IDs

**Relationships**:

- **Has Many**: PlannedExercise (one-to-many, embedded array)

---

### PlannedExercise

Template exercise within a workout plan.

**Attributes**:

- `id`: string (UUID) - Unique identifier within plan
- `muscleGroups`: MuscleGroup[] - Target muscles
- `machine`: GymMachine - Equipment
- `targetSets`: number - Intended number of sets
- `targetReps`: number - Intended reps per set
- `order`: number - Position in plan (0-indexed)
- `notes`: string | null - Optional planning notes

**Business Rules**:

- Used as template only, not for tracking actual performance
- When workout started from plan, converted to Exercise with empty sets array
- User fills in actual sets/reps during workout

**Relationships**:

- **Belongs To**: WorkoutPlan (parent entity)

---

### UserSettings

User preferences for app configuration.

**Attributes**:

- `theme`: 'light' | 'dark' - UI theme preference
- `notifications`: boolean - Enable 3-hour workout notifications
- `defaultMuscleGroups`: MuscleGroup[] - Quick-select favorites (future enhancement)
- `defaultMachines`: GymMachine[] - Quick-select favorites (future enhancement)

**Storage Key**: `settings:preferences` (single instance)

**Business Rules**:

- Singleton pattern (only one settings record)
- Theme applied globally via React Context
- Notifications require device permission (handled at OS level)

---

## Type Definitions (TypeScript)

### Enums & Constants

```typescript
// From consts/muscles.ts
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

// From consts/machines.ts
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

export type WorkoutStatus = "in-progress" | "completed" | "incomplete";
export type ThemeMode = "light" | "dark";
```

### Entity Interfaces

```typescript
// lib/storage/types.ts

export interface SetEntry {
  id: string;
  reps: number;
  order: number;
  weight: number | null;
}

export interface Exercise {
  id: string;
  muscleGroups: MuscleGroup[];
  machine: GymMachine;
  sets: SetEntry[];
  order: number;
  createdAt: number;
  notes: string | null;
}

export interface Workout {
  id: string;
  startTime: number;
  endTime: number | null;
  pausedAt: number | null;
  accumulatedTime: number;
  status: WorkoutStatus;
  exercises: Exercise[];
  createdAt: number;
  updatedAt: number;
}

export interface PlannedExercise {
  id: string;
  muscleGroups: MuscleGroup[];
  machine: GymMachine;
  targetSets: number;
  targetReps: number;
  order: number;
  notes: string | null;
}

export interface WorkoutPlan {
  id: string;
  dayOfWeek: number; // 0-6
  name: string;
  plannedExercises: PlannedExercise[];
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  theme: ThemeMode;
  notifications: boolean;
  defaultMuscleGroups: MuscleGroup[];
  defaultMachines: GymMachine[];
}
```

## Entity Relationships Diagram

```
UserSettings (singleton)
  ↓ configures
[User Preferences]

WorkoutPlan (multiple per dayOfWeek)
  ↓ contains (embedded)
PlannedExercise[] (template)
  ↓ converts to (on start)

Workout (one active, many completed)
  ↓ contains (embedded)
Exercise[]
  ↓ contains (embedded)
SetEntry[]
```

**Relationship Patterns**:

- **Embedded Arrays**: Exercise within Workout, SetEntry within Exercise, PlannedExercise within WorkoutPlan
- **No Foreign Keys**: Offline-first design, no relational constraints
- **Template Pattern**: WorkoutPlan → Workout (plan data copied, not linked)

## Data Lifecycle

### Workout Lifecycle

1. **Start Workout**:
   - Create Workout with status='in-progress', startTime=now, exercises=[]
   - Save to `workout:active`
   - No entry in `workouts:ids` yet

2. **Add Exercise**:
   - Generate Exercise with order=currentMaxOrder+1, sets=[]
   - Push to workout.exercises array
   - Update `workout:active`

3. **Add Set**:
   - Generate SetEntry with order=currentSetCount, reps=input
   - Push to exercise.sets array
   - Update `workout:active` (throttled every 5s)

4. **Pause/Resume**:
   - Pause: Set pausedAt=now, update accumulatedTime
   - Resume: Clear pausedAt, update startTime=now
   - Update `workout:active`

5. **Stop Workout**:
   - Set status='completed', endTime=now
   - Generate new UUID, move from `workout:active` → `workout:{id}`
   - Prepend ID to `workouts:ids` array (newest first)
   - Clear `workout:active`

6. **Force-Close Recovery**:
   - On app launch, check `workout:active`
   - If exists with status='in-progress', set status='incomplete'
   - Show recovery modal (Resume/Discard)

### Plan Lifecycle

1. **Create Plan**:
   - Generate WorkoutPlan with dayOfWeek, plannedExercises=[]
   - Save to `plan:{id}`
   - Add ID to `plans:byDay:{dayOfWeek}` index

2. **Start from Plan**:
   - Load plan data
   - Convert PlannedExercise → Exercise (copy muscleGroups, machine, but sets=[])
   - Create Workout with converted exercises
   - Save to `workout:active`

3. **Edit Plan**:
   - Update `plan:{id}` directly
   - No effect on historical workouts (decoupled)

## Data Validation Rules

### Workout Validation

- ✅ Only one workout with status='in-progress' allowed
- ✅ startTime < endTime (if endTime exists)
- ✅ accumulatedTime ≥ 0
- ✅ exercises array can be empty (timer-only workout)

### Exercise Validation

- ✅ muscleGroups.length ≥ 1 (at least one muscle)
- ✅ muscleGroups.length ≤ 5 (reasonable limit)
- ✅ sets.length ≥ 1 (at least one set)
- ✅ sets.length ≤ 20 (UI/UX limit)
- ✅ All muscleGroups must be from MUSCLE_GROUPS const
- ✅ machine must be from GYM_MACHINES const

### SetEntry Validation

- ✅ reps > 0 (must complete at least one rep)
- ✅ reps ≤ 999 (reasonable upper bound)
- ✅ order ≥ 0

### WorkoutPlan Validation

- ✅ dayOfWeek ∈ [0, 6]
- ✅ name.length > 0 and ≤ 50 chars
- ✅ plannedExercises can be empty (plan without exercises)

## Storage Size Estimation

**Per Workout** (typical):

- Workout metadata: ~200 bytes
- 5 exercises × 150 bytes: ~750 bytes
- 5 exercises × 4 sets × 50 bytes: ~1000 bytes
- **Total per workout**: ~2KB

**100 Workouts**: ~200KB
**500 Workouts**: ~1MB

**AsyncStorage Limit**: 6MB
**Estimated Capacity**: ~3000 workouts before cleanup needed

**Mitigation**: Implement auto-cleanup of workouts older than 1 year in Phase 2 (not MVP).

## Migration Strategy

**V1 (MVP)**: No migrations needed (fresh installs only)

**Future Versions**:

- Add `version` field to all entities
- Implement migration functions in storage layer
- Run migrations on app launch if version mismatch

## Next Steps

Proceed to:

- Generate contracts/storage-api.md (AsyncStorage CRUD operations)
- Write quickstart.md (developer setup guide)
