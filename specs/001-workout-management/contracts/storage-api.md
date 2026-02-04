# Storage API Contract

**Date**: 2026-02-04
**Phase**: 1 - API Design
**Technology**: AsyncStorage (React Native)

## Overview

This contract defines the AsyncStorage interface for workout data persistence. All storage operations return Promises and handle JSON serialization/deserialization internally.

## Storage Keys

| Key Pattern            | Type            | Description                  | Example                  |
| ---------------------- | --------------- | ---------------------------- | ------------------------ |
| `workout:active`       | Workout \| null | Currently running workout    | Single instance          |
| `workout:{id}`         | Workout         | Completed/incomplete workout | `workout:abc-123`        |
| `workouts:ids`         | string[]        | Ordered list of workout IDs  | Newest first             |
| `plan:{id}`            | WorkoutPlan     | Workout plan template        | `plan:xyz-789`           |
| `plans:byDay:{day}`    | string[]        | Plan IDs for specific day    | `plans:byDay:1` (Monday) |
| `settings:preferences` | UserSettings    | User preferences             | Single instance          |

## Workout Storage Operations

### Get Active Workout

**Function**: `getActiveWorkout()`

**Returns**: `Promise<Workout | null>`

**Description**: Retrieves the currently active workout session.

**Contract**:

- Returns `null` if no active workout exists
- Returns Workout object with status='in-progress' or 'incomplete'
- Never throws (returns null on error after logging)

**Example**:

```typescript
const activeWorkout = await getActiveWorkout();
if (activeWorkout) {
  console.log("Resume workout:", activeWorkout.id);
}
```

---

### Save Active Workout

**Function**: `saveActiveWorkout(workout: Workout)`

**Returns**: `Promise<void>`

**Description**: Saves or updates the active workout session.

**Contract**:

- Overwrites existing `workout:active` if present
- Serializes workout to JSON before saving
- Validates workout.status is 'in-progress' or 'incomplete'
- Throws error if validation fails

**Example**:

```typescript
await saveActiveWorkout({
  id: "temp-123",
  status: "in-progress",
  startTime: Date.now(),
  // ... other fields
});
```

---

### Complete Workout

**Function**: `completeWorkout(workout: Workout)`

**Returns**: `Promise<string>` (new workout ID)

**Description**: Moves active workout to completed storage with new permanent ID.

**Contract**:

- Generates new UUID for workout
- Sets status='completed', endTime=now
- Saves to `workout:{newId}`
- Prepends newId to `workouts:ids`
- Removes `workout:active`
- Returns the new workout ID

**Side Effects**:

- Updates `workouts:ids` index
- Clears active workout slot

**Example**:

```typescript
const workoutId = await completeWorkout(activeWorkout);
console.log("Workout saved:", workoutId);
```

---

### Delete Active Workout

**Function**: `deleteActiveWorkout()`

**Returns**: `Promise<void>`

**Description**: Discards the active workout (used for recovery discard action).

**Contract**:

- Removes `workout:active` key
- Does not affect `workouts:ids` index
- Safe to call even if no active workout exists

**Example**:

```typescript
await deleteActiveWorkout(); // User chose "Discard" in recovery modal
```

---

### Get Workout by ID

**Function**: `getWorkoutById(id: string)`

**Returns**: `Promise<Workout | null>`

**Description**: Retrieves a specific completed workout.

**Contract**:

- Returns null if workout doesn't exist
- Returns Workout with status='completed' or 'incomplete'
- Never throws (returns null on error after logging)

**Example**:

```typescript
const workout = await getWorkoutById("abc-123");
if (workout) {
  console.log("Duration:", workout.accumulatedTime);
}
```

---

### Update Workout

**Function**: `updateWorkout(id: string, workout: Workout)`

**Returns**: `Promise<void>`

**Description**: Updates an existing completed workout (for edit feature).

**Contract**:

- Throws error if workout doesn't exist
- Sets updatedAt=now automatically
- Validates workout structure
- Does not affect `workouts:ids` index

**Example**:

```typescript
workout.exercises.push(newExercise);
await updateWorkout(workout.id, workout);
```

---

### Get Workout IDs (Paginated)

**Function**: `getWorkoutIds(offset: number, limit: number)`

**Returns**: `Promise<string[]>`

**Description**: Retrieves paginated list of workout IDs for history.

**Contract**:

- Returns empty array if offset >= total count
- Maximum limit=100 (enforced)
- IDs ordered newest first
- Never throws (returns empty array on error)

**Example**:

```typescript
const ids = await getWorkoutIds(0, 20); // First 20 workouts
const workouts = await Promise.all(ids.map(getWorkoutById));
```

---

### Get Workout Count

**Function**: `getWorkoutCount()`

**Returns**: `Promise<number>`

**Description**: Returns total number of saved workouts.

**Contract**:

- Returns 0 if no workouts exist
- Counts only completed/incomplete workouts (not active)
- Never throws (returns 0 on error)

**Example**:

```typescript
const count = await getWorkoutCount();
console.log(`You have ${count} workouts`);
```

---

## Workout Plan Storage Operations

### Save Workout Plan

**Function**: `saveWorkoutPlan(plan: WorkoutPlan)`

**Returns**: `Promise<string>` (plan ID)

**Description**: Creates or updates a workout plan.

**Contract**:

- If plan.id exists, updates existing plan
- If plan.id is empty, generates new UUID
- Adds to `plans:byDay:{dayOfWeek}` index
- Sets createdAt/updatedAt timestamps

**Example**:

```typescript
const planId = await saveWorkoutPlan({
  id: '',
  dayOfWeek: 1, // Monday
  name: 'Leg Day',
  plannedExercises: [...],
  createdAt: Date.now(),
  updatedAt: Date.now()
});
```

---

### Get Plans by Day

**Function**: `getPlansByDay(dayOfWeek: number)`

**Returns**: `Promise<WorkoutPlan[]>`

**Description**: Retrieves all workout plans for a specific day.

**Contract**:

- dayOfWeek must be 0-6 (Sunday-Saturday)
- Returns empty array if no plans exist
- Plans ordered by createdAt (oldest first)
- Never throws (returns empty array on error)

**Example**:

```typescript
const mondayPlans = await getPlansByDay(1);
mondayPlans.forEach((plan) => console.log(plan.name));
```

---

### Get Workout Plan by ID

**Function**: `getWorkoutPlanById(id: string)`

**Returns**: `Promise<WorkoutPlan | null>`

**Description**: Retrieves a specific workout plan.

**Contract**:

- Returns null if plan doesn't exist
- Never throws (returns null on error)

**Example**:

```typescript
const plan = await getWorkoutPlanById("xyz-789");
```

---

### Delete Workout Plan

**Function**: `deleteWorkoutPlan(id: string)`

**Returns**: `Promise<void>`

**Description**: Removes a workout plan.

**Contract**:

- Removes from `plan:{id}`
- Removes ID from `plans:byDay:{dayOfWeek}` index
- Safe to call even if plan doesn't exist

**Example**:

```typescript
await deleteWorkoutPlan("xyz-789");
```

---

## Settings Storage Operations

### Get Settings

**Function**: `getSettings()`

**Returns**: `Promise<UserSettings>`

**Description**: Retrieves user settings, returns defaults if not set.

**Contract**:

- Never returns null
- Returns default settings if none exist:
  - theme: 'dark'
  - notifications: true
  - defaultMuscleGroups: []
  - defaultMachines: []
- Never throws (returns defaults on error)

**Example**:

```typescript
const settings = await getSettings();
console.log("Current theme:", settings.theme);
```

---

### Save Settings

**Function**: `saveSettings(settings: UserSettings)`

**Returns**: `Promise<void>`

**Description**: Persists user settings.

**Contract**:

- Validates theme is 'light' or 'dark'
- Partial updates not supported (must pass complete object)
- Never throws (logs error silently)

**Example**:

```typescript
await saveSettings({
  theme: "light",
  notifications: false,
  defaultMuscleGroups: [],
  defaultMachines: [],
});
```

---

## Error Handling

### General Principles

- **Never throw on read operations**: Return null/empty array/defaults
- **Throw on write validation failures**: Prevent corrupt data
- **Log all errors**: Use console.error with context
- **Graceful degradation**: App should work even if storage fails

### Error Types

```typescript
class StorageError extends Error {
  constructor(
    message: string,
    public code: "VALIDATION_ERROR" | "SERIALIZATION_ERROR" | "STORAGE_ERROR",
    public context?: any,
  ) {
    super(message);
    this.name = "StorageError";
  }
}
```

**Example**:

```typescript
try {
  await saveActiveWorkout(invalidWorkout);
} catch (error) {
  if (error instanceof StorageError && error.code === "VALIDATION_ERROR") {
    // Handle validation error
  }
}
```

---

## Performance Requirements

| Operation           | Target | Notes                        |
| ------------------- | ------ | ---------------------------- |
| getActiveWorkout()  | <50ms  | Single key read              |
| saveActiveWorkout() | <100ms | Single key write (throttled) |
| getWorkoutIds()     | <100ms | Array read + slice           |
| getWorkoutById()    | <50ms  | Single key read              |
| getSettings()       | <50ms  | Single key read (cached)     |
| getPlansByDay()     | <200ms | Multiple key reads           |

**Optimization Strategies**:

- Cache settings in memory (invalidate on save)
- Throttle active workout saves (max 1 per 5 seconds)
- Batch workout ID reads with Promise.all

---

## Testing Strategy

**Manual Testing Checklist** (per constitution, no unit tests):

1. **Active Workout Lifecycle**:
   - [ ] Start workout → verify `workout:active` created
   - [ ] Add exercise → verify update persists
   - [ ] Pause/resume → verify timestamps correct
   - [ ] Complete workout → verify moved to permanent storage
   - [ ] Verify `workouts:ids` updated

2. **Force-Close Recovery**:
   - [ ] Start workout, force-close app
   - [ ] Reopen → verify recovery modal appears
   - [ ] Resume → verify workout continues correctly
   - [ ] Discard → verify `workout:active` deleted

3. **Pagination**:
   - [ ] Create 50 workouts
   - [ ] Load history in pages of 20
   - [ ] Verify correct workouts in correct order

4. **Theme Persistence**:
   - [ ] Change theme, close app
   - [ ] Reopen → verify theme persists

5. **Plan Management**:
   - [ ] Create plan for Monday
   - [ ] Start workout from plan
   - [ ] Verify plan template copied correctly

---

## Implementation Notes

### AsyncStorage Limits

- **Max key length**: 1024 characters
- **Max value size**: 2MB per key
- **Total storage**: 6MB (iOS), varies on Android
- **Keys are strings**: All keys stored as string type

### JSON Serialization

- All objects serialized with `JSON.stringify()`
- Dates stored as Unix timestamps (numbers)
- UUIDs as strings
- Arrays preserved with order

### Concurrent Access

- AsyncStorage is not transactional
- Single-threaded JavaScript execution prevents race conditions
- TanStack Query handles concurrent reads via caching

### Migration Path

- Version 1: No migrations (fresh install)
- Future: Add `storageVersion` key, run migrations on version mismatch

---

## Example Implementation Snippet

```typescript
// lib/storage/workoutStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Workout } from "./types";

const ACTIVE_WORKOUT_KEY = "workout:active";

export async function getActiveWorkout(): Promise<Workout | null> {
  try {
    const json = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!json) return null;
    return JSON.parse(json) as Workout;
  } catch (error) {
    console.error("Error loading active workout:", error);
    return null;
  }
}

export async function saveActiveWorkout(workout: Workout): Promise<void> {
  if (!["in-progress", "incomplete"].includes(workout.status)) {
    throw new StorageError(
      "Active workout must have status in-progress or incomplete",
      "VALIDATION_ERROR",
      { status: workout.status },
    );
  }

  try {
    const json = JSON.stringify(workout);
    await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, json);
  } catch (error) {
    throw new StorageError(
      "Failed to save active workout",
      "STORAGE_ERROR",
      error,
    );
  }
}

// ... other functions
```

---

## Contract Versioning

**Version**: 1.0.0
**Date**: 2026-02-04
**Status**: Draft

**Change Log**:

- 2026-02-04: Initial contract definition

**Next Review**: After Phase 1 implementation complete
