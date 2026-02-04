# Storage API Contract: Completed Workouts Query

**Feature**: Display Saved Workouts on Home Screen  
**Date**: 2026-02-04  
**Purpose**: Define the expected behavior of workout storage functions used for pagination

## Contract Overview

This feature relies on existing storage functions from `lib/storage/workoutStorage.ts` (implemented in feature 001-workout-management). This document specifies the contract for how these functions must behave to support infinite scroll pagination.

## Function: getWorkoutIds

**Signature**:

```typescript
function getWorkoutIds(
  offset: number = 0,
  limit: number = 20,
): Promise<string[]>;
```

**Purpose**: Retrieve a paginated slice of workout IDs for batch fetching

**Parameters**:

- `offset` (number, default: 0): Zero-indexed starting position in the IDs array
- `limit` (number, default: 20): Maximum number of IDs to return (capped at 100)

**Returns**: `Promise<string[]>` - Array of workout ID strings, ordered newest-first

**Behavior**:

| Scenario                  | Input                                      | Expected Output                                  |
| ------------------------- | ------------------------------------------ | ------------------------------------------------ |
| First page (initial load) | `offset=0, limit=20`                       | First 20 IDs: `['id1', 'id2', ..., 'id20']`      |
| Second page               | `offset=20, limit=20`                      | Next 20 IDs: `['id21', 'id22', ..., 'id40']`     |
| Partial page (near end)   | `offset=90, limit=20` when only 95 total   | Remaining 5 IDs: `['id91', 'id92', ..., 'id95']` |
| Beyond available data     | `offset=200, limit=20` when only 100 total | Empty array: `[]`                                |
| No workouts exist         | `offset=0, limit=20`                       | Empty array: `[]`                                |

**Error Handling**:

- AsyncStorage read failure → Return `[]` and log error (don't throw)
- Corrupted JSON data → Return `[]` and log error
- Invalid offset/limit (negative) → Return `[]` and log warning

**Performance**:

- MUST complete in <100ms for typical dataset (500 workouts)
- MUST NOT load all workout data, only the IDs list from `workouts:ids` key

**Storage Key**: `workouts:ids` → `string[]` (master ID list)

---

## Function: getWorkoutById

**Signature**:

```typescript
function getWorkoutById(id: string): Promise<Workout | null>;
```

**Purpose**: Fetch complete workout data for a single workout ID

**Parameters**:

- `id` (string): Workout UUID to retrieve

**Returns**: `Promise<Workout | null>` - Full workout object or null if not found/invalid

**Behavior**:

| Scenario               | Input                  | Expected Output                                 |
| ---------------------- | ---------------------- | ----------------------------------------------- |
| Valid workout exists   | `id='workout-123'`     | Full Workout object with all exercises and sets |
| Workout not found      | `id='nonexistent'`     | `null` (no error thrown)                        |
| Corrupted workout data | `id='corrupted-entry'` | `null` and log error (don't crash)              |
| Empty/invalid ID       | `id=''`                | `null` (no error thrown)                        |

**Error Handling**:

- AsyncStorage read failure → Return `null` and log error
- JSON.parse failure → Return `null` and log error
- Schema validation failure → Return `null` and log warning
- MUST NOT throw exceptions (caller expects null for missing/invalid data)

**Performance**:

- MUST complete in <50ms per workout (individual key read)
- Parallel fetches: Support up to 20 concurrent calls without performance degradation

**Storage Key**: `workout:{id}` → `Workout` (individual workout record)

---

## Function: getWorkoutCount (Optional)

**Signature**:

```typescript
function getWorkoutCount(): Promise<number>;
```

**Purpose**: Get total count of completed workouts (for "X of Y" display, if implemented)

**Returns**: `Promise<number>` - Total number of workout IDs in storage

**Behavior**:

| Scenario           | Expected Output              |
| ------------------ | ---------------------------- |
| 95 workouts stored | `95`                         |
| No workouts stored | `0`                          |
| Storage error      | `0` (log error, don't throw) |

**Performance**:

- MUST complete in <50ms (reads only `workouts:ids` length)

**Storage Key**: `workouts:ids` → `string[]` (count array length)

---

## Batch Fetching Pattern

**Recommended Usage** (implemented in `app/index.tsx`):

```typescript
async function fetchWorkoutBatch(offset: number, limit: number) {
  // Step 1: Get IDs for this page
  const ids = await getWorkoutIds(offset, limit);

  // Step 2: Fetch workouts in parallel
  const workouts = await Promise.all(ids.map((id) => getWorkoutById(id)));

  // Step 3: Filter out nulls (corrupted/missing entries)
  const validWorkouts = workouts.filter((w): w is Workout => w !== null);

  // Step 4: Filter to completed workouts only
  const completedWorkouts = validWorkouts.filter(
    (w) => w.status === "completed",
  );

  return {
    workouts: completedWorkouts,
    nextOffset: offset + limit,
    hasMore: ids.length === limit, // If got full batch, likely more available
  };
}
```

**Why This Pattern**:

- Parallel fetches minimize total latency (20 concurrent reads ~50ms vs sequential ~1000ms)
- Null filtering handles corrupted data gracefully
- Status filtering ensures only completed workouts displayed
- `hasMore` detection enables infinite scroll pagination

---

## TanStack Query Integration

**Query Configuration**:

```typescript
useInfiniteQuery({
  queryKey: ["workouts", "completed"],
  queryFn: ({ pageParam = 0 }) => fetchWorkoutBatch(pageParam, 20),
  getNextPageParam: (lastPage) =>
    lastPage.hasMore ? lastPage.nextOffset : undefined,
  initialPageParam: 0,
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  refetchOnMount: true, // Refresh when returning to screen
});
```

**Expected Behavior**:

1. **Initial Load**: Fetches page 0 (offset=0, limit=20)
2. **User Scrolls**: `onEndReached` triggers `fetchNextPage()` → fetches page 1 (offset=20, limit=20)
3. **Cache Hit**: Returning to screen shows cached data immediately, refetches in background
4. **Error Recovery**: Retry button calls `refetch()` → re-fetches current page

---

## Error States Contract

**Storage Function Errors** → **UI Display**

| Error Condition          | Storage Function Behavior        | UI Response                                           |
| ------------------------ | -------------------------------- | ----------------------------------------------------- |
| AsyncStorage unavailable | Return `[]` or `null`, log error | Show error banner with retry button                   |
| Corrupted workout JSON   | Return `null`, log error         | Skip workout, continue with valid ones                |
| Network/permission error | Return `[]` or `null`, log error | Show error banner with retry button                   |
| All workouts corrupted   | Return `[]` for all IDs          | Show empty state (no error if technically successful) |

**Contract Guarantee**: Storage functions NEVER throw exceptions to UI layer. Always return empty/null values with console logging.

---

## Performance Contract

**Latency Targets** (on mid-range device, 500 workouts stored):

- `getWorkoutIds(0, 20)`: <100ms
- `getWorkoutById(id)`: <50ms per call
- Parallel fetch of 20 workouts: <200ms total
- `getWorkoutCount()`: <50ms

**Memory Contract**:

- Single workout object: <10KB in memory
- Batch of 20 workouts: <200KB in memory
- TanStack Query cache (5 pages): <1MB in memory

**Scaling Contract**:

- MUST support up to 1000 workouts without performance degradation
- Pagination MUST prevent loading entire dataset into memory
- FlatList virtualization MUST keep rendered items <50 at any time

---

## Testing Checklist

Manual validation of contract adherence:

- [ ] `getWorkoutIds(0, 20)` returns first 20 IDs in correct order (newest first)
- [ ] `getWorkoutIds(20, 20)` returns next 20 IDs (no duplicates with first call)
- [ ] `getWorkoutIds` with `offset > total count` returns `[]`
- [ ] `getWorkoutById` with valid ID returns full Workout object
- [ ] `getWorkoutById` with invalid ID returns `null` (no exception)
- [ ] Corrupted workout entry returns `null` and logs error
- [ ] Deleting AsyncStorage data → functions return `[]`/`null` gracefully
- [ ] Parallel fetch of 20 workouts completes in <300ms

---

## Breaking Changes

This contract extends (but does not modify) the existing storage API from feature 001. If future features change these function signatures, this document must be updated and all dependent features re-tested.

**Version**: 1.0.0  
**Last Updated**: 2026-02-04
