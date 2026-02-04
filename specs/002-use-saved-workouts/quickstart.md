# Quickstart: Display Saved Workouts on Home Screen

**Feature**: 002-use-saved-workouts  
**Date**: 2026-02-04  
**Audience**: Developers implementing or reviewing this feature

## Overview

This feature replaces hardcoded mock workout data in `app/index.tsx` with real completed workouts from AsyncStorage, implementing infinite scroll pagination.

**Estimated Implementation Time**: 2-3 hours  
**Complexity**: Low (reuses existing infrastructure)  
**Files Modified**: 1-2 files  
**New Dependencies**: None

---

## Prerequisites

Before starting:

1. ✅ Feature 001-workout-management completed (provides storage APIs and WorkoutCard component)
2. ✅ Development environment set up (Expo, Node.js, physical device or emulator)
3. ✅ Familiarity with:
   - TanStack Query v5 (React Query)
   - React Native FlatList
   - TypeScript strict mode

**Read These Documents First**:

- [spec.md](../spec.md) - Feature requirements and user scenarios
- [data-model.md](../data-model.md) - Data entities and storage patterns
- [contracts/storage-api.md](../contracts/storage-api.md) - Storage function contracts

---

## Quick Implementation Guide

### Step 1: Understand Current Bug (5 minutes)

**Current Code** (`app/index.tsx` line 23):

```typescript
const workouts = Array.from({ length: 30 }).map((_, i) => `Workout ${i + 1}`);
```

**Problem**:

- Hardcoded mock data (30 placeholder strings)
- WorkoutCard component expects `Workout` objects, not strings
- No connection to actual saved workouts in AsyncStorage

**Where Used** (line ~198):

```tsx
{
  workouts.map((workout) => <WorkoutCard key={workout} workout={workout} />);
}
```

**Error**: Type mismatch - `workout` is `string`, but WorkoutCard expects `Workout` object

---

### Step 2: Create Batch Fetch Function (30 minutes)

**Add to `lib/hooks/useWorkouts.ts`** (or create new file):

```typescript
import { getWorkoutIds, getWorkoutById } from "@/lib/storage/workoutStorage";
import { Workout } from "@/lib/storage/types";

export async function fetchWorkoutBatch(
  offset: number,
  limit: number,
): Promise<{
  workouts: Workout[];
  nextOffset: number;
  hasMore: boolean;
}> {
  try {
    // Fetch IDs for this page
    const ids = await getWorkoutIds(offset, limit);

    // Fetch workouts in parallel
    const workouts = await Promise.all(
      ids.map((id) =>
        getWorkoutById(id).catch((err) => {
          console.error(`Failed to load workout ${id}:`, err);
          return null;
        }),
      ),
    );

    // Filter out nulls and non-completed workouts
    const validWorkouts = workouts
      .filter((w): w is Workout => w !== null)
      .filter((w) => w.status === "completed");

    return {
      workouts: validWorkouts,
      nextOffset: offset + limit,
      hasMore: ids.length === limit,
    };
  } catch (error) {
    console.error("Error fetching workout batch:", error);
    return {
      workouts: [],
      nextOffset: offset,
      hasMore: false,
    };
  }
}
```

**Key Points**:

- Returns paginated batch with next offset calculation
- Handles errors gracefully (returns empty array, doesn't crash)
- Filters corrupted entries and incomplete workouts
- `hasMore` indicates if pagination should continue

---

### Step 3: Replace Mock Data with Query (45 minutes)

**In `app/index.tsx`**, replace the mock data line and ScrollView with:

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchWorkoutBatch } from "@/lib/hooks/useWorkouts";

// Remove this line:
// const workouts = Array.from({ length: 30 }).map((_, i) => `Workout ${i + 1}`);

// Add this query:
const {
  data: workoutsData,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  error,
  refetch,
} = useInfiniteQuery({
  queryKey: ["workouts", "completed"],
  queryFn: ({ pageParam = 0 }) => fetchWorkoutBatch(pageParam, 20),
  getNextPageParam: (lastPage) =>
    lastPage.hasMore ? lastPage.nextOffset : undefined,
  initialPageParam: 0,
  staleTime: 5 * 60 * 1000, // 5 minutes
  refetchOnMount: true,
});

// Flatten pages into single array
const workouts = workoutsData?.pages.flatMap((page) => page.workouts) ?? [];
```

**Then replace the ScrollView section** (~line 198):

```tsx
{
  /* Replace existing ScrollView with FlatList */
}
<FlatList
  data={workouts}
  keyExtractor={(workout) => workout.id}
  renderItem={({ item: workout }) => (
    <WorkoutCard key={workout.id} workout={workout} />
  )}
  onEndReached={() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }}
  onEndReachedThreshold={0.5}
  ListEmptyComponent={
    isLoading ? (
      <View className="flex-1 justify-center items-center py-12">
        <ActivityIndicator size="large" />
      </View>
    ) : (
      <EmptyWorkoutState />
    )
  }
  ListFooterComponent={
    isFetchingNextPage ? (
      <View className="py-4">
        <ActivityIndicator />
      </View>
    ) : null
  }
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 128 }}
/>;
```

**Key Changes**:

- FlatList instead of ScrollView (enables virtualization)
- `onEndReached` triggers next page fetch
- `ListEmptyComponent` shows empty state or loading spinner
- `ListFooterComponent` shows pagination loading

---

### Step 4: Add Empty State Component (30 minutes)

**Add new component in `app/index.tsx`** (before main component):

```typescript
import { Lucide } from '@react-native-vector-icons/lucide';

function EmptyWorkoutState() {
  return (
    <View className="flex-1 justify-center items-center py-16 px-6">
      <Lucide
        name="dumbbell"
        size={64}
        color="rgb(156, 163, 175)" // gray-400
        className="mb-6"
      />
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        No workouts yet
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center">
        Start your first workout!
      </Text>
    </View>
  );
}
```

**Key Points**:

- Uses existing Lucide icon library (no new assets)
- Matches app's Tailwind styling
- Dark mode support via `dark:` classes
- Existing "Start Workout" button provides call-to-action (no duplication needed)

---

### Step 5: Add Error Recovery (20 minutes)

**Add error banner above FlatList**:

```tsx
{error && (
  <View className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-4 mx-4">
    <Text className="text-red-700 dark:text-red-300 font-semibold mb-2">
      Failed to load workouts
    </Text>
    <TouchableOpacity
      onPress={() => refetch()}
      className="bg-red-600 px-4 py-2 rounded-lg"
    >
      <Text className="text-white font-semibold text-center">
        Retry
      </Text>
    </TouchableOpacity>
  </View>
)}

<FlatList ... />
```

**Key Points**:

- Only shows when `error` is truthy
- Retry button calls `refetch()` from query
- Fallback: "Start New Workout" button remains accessible in header
- Non-blocking: doesn't prevent navigation to other screens

---

### Step 6: Import Cleanup (5 minutes)

**Add required imports at top of `app/index.tsx`**:

```typescript
import { FlatList, ActivityIndicator } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchWorkoutBatch } from "@/lib/hooks/useWorkouts";
```

**Remove unused imports** (if any):

- Remove ScrollView if no longer used elsewhere in file

---

## Testing Checklist

After implementation, test these scenarios manually:

### Basic Functionality

- [ ] App loads without errors
- [ ] With 0 workouts: Empty state shows with dumbbell icon
- [ ] With 1 workout: Single workout card displays correctly
- [ ] With 5 workouts: All 5 cards display in correct order (newest first)
- [ ] Tap workout card: Navigates to workout detail screen

### Pagination

- [ ] Create 50 workouts (or use test script)
- [ ] Initial load shows ~20 workouts
- [ ] Scroll to bottom: Loading spinner appears
- [ ] Next batch loads automatically
- [ ] Continue scrolling: All 50 workouts eventually visible
- [ ] Smooth scrolling (no lag or stuttering)

### Error Handling

- [ ] Force AsyncStorage error (disable storage in device settings)
- [ ] Error banner displays with retry button
- [ ] Tap retry: Attempts to reload workouts
- [ ] "Start New Workout" button still accessible

### Performance

- [ ] With 100 workouts: Home screen loads in <2 seconds
- [ ] Scrolling maintains 60fps (no frame drops)
- [ ] Memory usage stays reasonable (<200MB)

### Edge Cases

- [ ] Dark mode toggle: All UI elements adapt correctly
- [ ] Complete workout, return to home: New workout appears at top
- [ ] App backgrounded and resumed: List refreshes correctly

---

## Common Issues & Solutions

### Issue: "Cannot read property 'map' of undefined"

**Cause**: `workoutsData` is undefined during initial load

**Solution**: Use nullish coalescing:

```typescript
const workouts = workoutsData?.pages.flatMap((page) => page.workouts) ?? [];
```

### Issue: Infinite re-rendering loop

**Cause**: `onEndReached` triggered too frequently

**Solution**: Add condition to `onEndReached`:

```typescript
onEndReached={() => {
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
}}
```

### Issue: WorkoutCard displays "undefined" data

**Cause**: Workout object missing required fields

**Solution**: Check storage functions return full Workout objects:

```bash
# In React Native debugger console:
getWorkoutById('some-id').then(console.log)
```

### Issue: Empty state never shows

**Cause**: `isLoading` true indefinitely or wrong condition

**Solution**: Verify query configuration includes `initialPageParam: 0`

---

## Performance Optimization (Optional)

If experiencing performance issues with large datasets:

### 1. Add FlatList Optimizations

```typescript
<FlatList
  data={workouts}
  removeClippedSubviews={true}  // Unmount off-screen items (Android)
  maxToRenderPerBatch={10}      // Render 10 items per batch
  windowSize={21}                // Keep 10 items above/below viewport
  initialNumToRender={20}        // Render 20 items initially
  // ... rest of props
/>
```

### 2. Memoize WorkoutCard (if re-rendering excessively)

```typescript
import { memo } from 'react';

const MemoizedWorkoutCard = memo(WorkoutCard);

// Use in FlatList:
renderItem={({ item }) => <MemoizedWorkoutCard workout={item} />}
```

---

## Architecture Decisions

### Why useInfiniteQuery?

- **Built-in Pagination**: Handles offset tracking automatically
- **Cache Management**: Keeps fetched pages in memory, shows stale data while refetching
- **DevTools**: Excellent debugging via React Query DevTools
- **Simplicity**: No manual state management for pages

**Alternative Considered**: Manual useState with offset tracking → Rejected (more code, reinvents query functionality)

### Why FlatList over ScrollView?

- **Virtualization**: Only renders visible items (ScrollView renders all)
- **Performance**: Scales to 1000+ items without lag
- **Built-in Infinite Scroll**: `onEndReached` prop
- **Memory Efficient**: Unmounts off-screen items

**Alternative Considered**: ScrollView with manual pagination → Rejected (poor performance, memory issues)

### Why Inline Error Banner?

- **Non-blocking**: User can still navigate to other screens
- **Persistent Retry**: Button always visible, no modal dismissal needed
- **Clear Action**: Immediate retry option

**Alternative Considered**: Modal error dialog → Rejected (blocks UI, requires dismissal)

---

## Next Steps

After completing this feature:

1. **Commit Changes**:

   ```bash
   git add .
   git commit -m "feat: display saved workouts with pagination (#002)"
   ```

2. **Manual Testing**: Complete testing checklist above

3. **User Testing**: Have users test with real workout data (10-50 workouts)

4. **Monitor Performance**: Check memory usage with 200+ workouts

5. **Optional Enhancements** (future features):
   - Workout filtering (by date, muscle group)
   - Search functionality
   - Workout statistics dashboard

---

## Support & References

**Related Documentation**:

- [Feature 001 Data Model](../../001-workout-management/data-model.md) - Workout entity schema
- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview) - React Query API
- [React Native FlatList](https://reactnative.dev/docs/flatlist) - FlatList API reference

**File Locations**:

- Modified: `app/index.tsx`
- New/Modified: `lib/hooks/useWorkouts.ts`
- Referenced: `lib/storage/workoutStorage.ts`
- Referenced: `components/WorkoutCard.tsx`

**Estimated Total Time**: 2-3 hours (implementation + testing)

---

**Last Updated**: 2026-02-04  
**Feature Status**: Ready for implementation
