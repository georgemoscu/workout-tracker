# Data Model: Display Saved Workouts on Home Screen

**Date**: 2026-02-04
**Phase**: 1 - Data Design
**Input**: Feature spec requirements and research decisions

## Overview

This feature does **not introduce new entities**. It exclusively uses existing data models from feature 001-workout-management. This document references the relevant entities and their usage in this feature.

## Referenced Entities

### Workout (Existing)

Defined in: `specs/001-workout-management/data-model.md`  
TypeScript Type: `lib/storage/types.ts`

**Attributes Used in This Feature**:

- `id`: string (UUID) - Unique identifier for navigation and list keys
- `startTime`: number (Unix timestamp) - Displayed as formatted date on workout card
- `endTime`: number | null - Used to calculate duration
- `accumulatedTime`: number (seconds) - Displayed as formatted duration
- `status`: 'in-progress' | 'completed' | 'incomplete' - Filtered to show only 'completed'
- `exercises`: Exercise[] - Used to calculate exercise count and preview first 2
- `createdAt`: number (Unix timestamp) - Not displayed, used for sorting (newest first)

**Query Filter**: `status === 'completed'` only

**Relationships in This Feature**:

- **Has Many**: Exercise (embedded array) - First 2 exercises shown in preview

---

### Exercise (Existing)

Defined in: `specs/001-workout-management/data-model.md`  
TypeScript Type: `lib/storage/types.ts`

**Attributes Used in This Feature**:

- `muscleGroups`: MuscleGroup[] - Displayed in exercise preview
- `machine`: GymMachine - Displayed in exercise preview
- `sets`: SetEntry[] - Used to count total sets

**Usage**: Array is sliced (`.slice(0, 2)`) to show only first 2 exercises in workout card preview.

---

## Storage Access Patterns

This feature uses existing storage functions without modification:

### Read Operations

**Function**: `getWorkoutIds(offset: number, limit: number): Promise<string[]>`  
**Defined In**: `lib/storage/workoutStorage.ts`  
**Usage**: Fetch paginated workout ID list (20 IDs per batch)

**Function**: `getWorkoutById(id: string): Promise<Workout | null>`  
**Defined In**: `lib/storage/workoutStorage.ts`  
**Usage**: Fetch full workout data for each ID in batch

**Function**: `getWorkoutCount(): Promise<number>`  
**Defined In**: `lib/storage/workoutStorage.ts`  
**Usage**: Optional - determine total count for "X of Y" display (if needed)

### AsyncStorage Keys Used

- `workouts:ids` → `string[]` - Master list of workout IDs (newest first)
- `workout:{id}` → `Workout` - Individual workout records

### Data Flow

```
User opens app/index.tsx
  ↓
useInfiniteQuery triggers fetchWorkoutBatch(offset=0, limit=20)
  ↓
getWorkoutIds(0, 20) → ['id1', 'id2', ..., 'id20']
  ↓
Promise.all(ids.map(id => getWorkoutById(id)))
  ↓
Filter results where status === 'completed'
  ↓
Return { workouts: Workout[], nextOffset: 20 }
  ↓
FlatList renders WorkoutCard for each workout
  ↓
User scrolls to bottom
  ↓
onEndReached triggers fetchNextPage() → fetchWorkoutBatch(offset=20, limit=20)
  ↓
Repeat for next batch
```

## Derived Data

No new entities or derived collections. The following are calculated on-the-fly in UI components:

### Workout Card Display Data

Calculated in `components/WorkoutCard.tsx` (existing component):

- **Formatted Date**: `formatDate(workout.startTime)` - e.g., "Feb 4, 2026"
- **Formatted Duration**: `formatDuration(workout.accumulatedTime)` - e.g., "45m 30s"
- **Exercise Count**: `workout.exercises.length` - e.g., "5 exercises"
- **Exercise Preview**: `workout.exercises.slice(0, 2)` - First 2 exercises only
- **Total Sets**: Sum of `exercise.sets.length` across all exercises
- **Total Reps**: Sum of `set.reps` across all sets

All calculations already implemented in WorkoutCard component (no changes needed).

## Empty State (UI-Only)

Not a data entity, but feature-specific UI state:

**Condition**: `workouts.length === 0`  
**Display**:

- Icon: Lucide `dumbbell` (64px, gray color)
- Heading: "No workouts yet"
- Subtext: "Start your first workout!"
- Action: Existing "Start Workout" button (already in UI)

## Error State (UI-Only)

Not a data entity, but feature-specific error handling:

**Condition**: AsyncStorage query fails  
**Display**:

- Error banner with message: "Failed to load workouts"
- Retry button triggering `refetch()`
- Fallback: "Start New Workout" button remains accessible

## Loading States (UI-Only)

**Initial Load**: `isLoading === true`

- Display: Centered ActivityIndicator

**Pagination Load**: `isFetchingNextPage === true`

- Display: Small spinner in FlatList footer

**Cached Data**: TanStack Query shows stale data immediately while refetching in background

## Data Validation

All validation rules inherited from existing Workout entity (feature 001). No feature-specific validation needed.

### Corrupted Data Handling

Per research.md decision:

- **Skip Invalid Entries**: Filter out workouts that fail JSON.parse or schema validation
- **Log Error**: Console.error for debugging
- **Continue**: Display valid workouts, don't crash on single corrupted entry

Implementation pattern:

```typescript
const workouts = await Promise.all(
  ids.map((id) =>
    getWorkoutById(id).catch((err) => {
      console.error(`Failed to load workout ${id}:`, err);
      return null; // Skip this workout
    }),
  ),
);
return workouts.filter(Boolean); // Remove nulls
```

## Performance Considerations

### Pagination Rationale

- **Batch Size**: 20 workouts per batch
  - Balances initial load speed (<2s) with reduced re-fetches
  - Each workout JSON ~5-10KB → 20 workouts = ~100-200KB per batch
- **Lazy Loading**: Only fetch additional batches when user scrolls
- **Virtual Rendering**: FlatList only renders visible items (typically 10-15 on screen)

### Memory Management

- **TanStack Query Cache**: Keeps fetched batches in memory (30min cache time)
- **FlatList Optimization**: `removeClippedSubviews={true}` unmounts off-screen items
- **Maximum Memory**: ~5MB for 500 workouts cached (acceptable for mobile)

## Schema Reference

Full schema documented in: `specs/001-workout-management/data-model.md`

TypeScript interfaces in: `lib/storage/types.ts`

No schema changes required for this feature.

## Phase 1 Data Model Completion

✅ All data access patterns defined  
✅ No new entities required  
✅ Storage functions confirmed available  
✅ UI-only states documented  
✅ Performance constraints addressed

Ready for contracts and quickstart generation.
