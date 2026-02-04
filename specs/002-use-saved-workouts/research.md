# Research: Display Saved Workouts on Home Screen

**Date**: 2026-02-04
**Phase**: 0 - Technology Research & Decisions
**Input**: Feature spec and technical context from plan.md

## Research Summary

This feature builds upon existing infrastructure from feature 001-workout-management. All major technical decisions (TanStack Query, AsyncStorage patterns, component architecture) were resolved in that feature's research phase. This document captures any feature-specific decisions.

## Resolved Questions from Technical Context

All technical unknowns from plan.md Technical Context have been resolved:

- ✅ **Language/Version**: TypeScript (strict), React 19.1.0, React Native 0.81.5
- ✅ **Primary Dependencies**: Expo ~54, TanStack Query v5, AsyncStorage v2.2
- ✅ **Storage**: AsyncStorage with structured keys (`workout:{id}`, `workouts:ids`)
- ✅ **Testing**: Manual testing on physical/emulator devices
- ✅ **Target Platform**: iOS/Android via Expo
- ✅ **Project Type**: Mobile (Expo Router)
- ✅ **Performance Goals**: <2s load for 100 workouts, 60fps scrolling
- ✅ **Constraints**: Offline-first, <200MB memory, infinite scroll
- ✅ **Scale/Scope**: 500+ workouts, 20 per batch, 1 screen modification

## Feature-Specific Research

### 1. Infinite Scroll Implementation Pattern

**Question**: What's the simplest infinite scroll pattern for React Native FlatList with TanStack Query?

**Decision**: FlatList `onEndReached` callback with TanStack Query's `fetchNextPage`

**Rationale**:

- **Native Pattern**: FlatList built-in infinite scroll via `onEndReached` prop
- **Query Integration**: TanStack Query v5 provides `useInfiniteQuery` hook with automatic pagination
- **Simplicity**: No additional libraries needed, aligns with constitution's simplicity principle
- **Performance**: FlatList virtualizes list items automatically (only renders visible items)

**Implementation Pattern**:

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['workouts', 'completed'],
  queryFn: ({ pageParam = 0 }) => fetchWorkoutBatch(pageParam, 20),
  getNextPageParam: (lastPage, pages) => lastPage.nextOffset,
  initialPageParam: 0
});

// In FlatList
<FlatList
  data={data?.pages.flatMap(page => page.workouts)}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isFetchingNextPage ? <Loader /> : null}
/>
```

**Alternatives Considered**:

- Manual pagination with offset state: Rejected - useInfiniteQuery handles this automatically
- Third-party infinite scroll library: Rejected - unnecessary dependency
- Load More button: Rejected - spec clarified automatic infinite scroll preferred

### 2. Empty State Visual Design

**Question**: What motivational graphic/illustration should the empty state display?

**Decision**: Simple icon-based illustration with workout-themed SVG icons (dumbbells, checkmark)

**Rationale**:

- **Simplicity**: SVG icons from existing `@react-native-vector-icons/lucide` package
- **No Assets**: Avoids adding image files to bundle
- **Constitution**: Keeps implementation simple, no design system complexity
- **Scalable**: Vector graphics work across screen sizes/densities

**Empty State Components**:

1. Large centered icon (Lucide `dumbbell` icon, 64px, gray)
2. Heading text: "No workouts yet"
3. Subtext: "Start your first workout!"
4. Call-to-action: Existing "Start Workout" button (already in UI)

**Alternatives Considered**:

- Custom illustration image: Rejected - adds asset management complexity
- Lottie animation: Rejected - new dependency, over-engineered
- Plain text only: Rejected - less engaging for first-time users

### 3. Error Recovery UX Flow

**Question**: How should error message and retry button be presented?

**Decision**: Inline error banner above workout list area with retry button

**Rationale**:

- **Non-blocking**: Users can still access other app features (navigation, settings)
- **Clear Action**: Retry button immediately visible, no modal dismissal needed
- **Fallback Visible**: "Start New Workout" button remains accessible in header
- **Constitution**: Simple error handling, no complex error boundary infrastructure

**Error UI Pattern**:

```tsx
{
  error && (
    <View className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-4">
      <Text className="text-red-700 dark:text-red-300 mb-2">
        Failed to load workouts
      </Text>
      <TouchableOpacity
        onPress={refetch}
        className="bg-red-600 px-4 py-2 rounded"
      >
        <Text className="text-white">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}
```

**Alternatives Considered**:

- Modal error dialog: Rejected - blocks UI, requires dismissal action
- Toast notification: Rejected - transient, doesn't show retry option persistently
- Silent failure with console log: Rejected - spec requires user-visible error

### 4. Loading State Strategy

**Question**: Should initial load show skeleton screens or simple spinner?

**Decision**: Simple centered spinner for initial load, footer spinner for pagination

**Rationale**:

- **Simplicity**: No skeleton component to build/maintain
- **Fast Load**: With AsyncStorage (local), load is <500ms typically - spinner sufficient
- **Constitution**: YAGNI - skeleton screens are over-engineering for local storage
- **Existing Pattern**: App already uses simple loading indicators elsewhere

**Loading UI**:

- Initial load: Centered ActivityIndicator
- Pagination load: Small spinner in FlatList footer
- No loading state for cached data (TanStack Query shows stale data immediately)

**Alternatives Considered**:

- Skeleton screens: Rejected - adds complexity, unnecessary for fast local storage
- Progressive loading: Rejected - AsyncStorage fast enough for simple spinner

## Best Practices Applied

### AsyncStorage Query Patterns

From feature 001 research, applying these existing patterns:

- **Batch Fetching**: `getWorkoutIds(offset, limit)` returns ID array slice
- **Individual Queries**: `getWorkoutById(id)` for each workout in batch
- **Parallel Fetching**: Use `Promise.all()` to fetch batch workouts concurrently
- **Error Handling**: Skip corrupted entries, log error, continue with valid workouts

### TanStack Query Configuration

Reusing configuration from feature 001:

- **staleTime**: 5 minutes (workouts don't change without user action)
- **cacheTime**: 30 minutes (keep recent workouts in memory)
- **refetchOnMount**: true (refresh list when returning to home screen)
- **refetchOnWindowFocus**: false (mobile app doesn't have window focus events)

### React Native Performance

- **FlatList**: Always use over ScrollView for long lists (virtualizes items)
- **keyExtractor**: Use workout.id for stable keys (prevents unnecessary re-renders)
- **onEndReachedThreshold**: 0.5 (trigger pagination when 50% from bottom)
- **removeClippedSubviews**: true (unmount off-screen items on Android)

## Dependencies Confirmed

All required dependencies already installed (from feature 001):

- ✅ `@tanstack/react-query` ^5.90.20
- ✅ `@react-native-async-storage/async-storage` ^2.2.0
- ✅ `@react-native-vector-icons/lucide` ^12.4.0
- ✅ `react-native` 0.81.5 (includes FlatList)

No new dependencies required.

## Implementation Notes

### Key Files to Modify

1. **app/index.tsx** (PRIMARY)
   - Remove line 23: `const workouts = Array.from({ length: 30 })...`
   - Replace with `useInfiniteQuery` for workout fetching
   - Add FlatList with `onEndReached` for infinite scroll
   - Add empty state component
   - Add error recovery banner

2. **lib/hooks/useWorkouts.ts** (OPTIONAL)
   - Consider adding `useCompletedWorkouts` hook if logic becomes complex
   - Keep hook focused: only data fetching, no UI logic

3. **lib/storage/workoutStorage.ts** (REFERENCE ONLY)
   - Already has `getWorkoutIds(offset, limit)` and `getWorkoutById(id)`
   - No modifications needed

### Testing Strategy

Manual testing checklist (constitution: no unit tests):

1. **Empty State**: Delete all workouts, verify empty state shows
2. **Single Workout**: Complete 1 workout, verify card displays correctly
3. **Pagination**: Create 50 workouts, verify initial 20 load, scroll triggers next batch
4. **Error Simulation**: Force AsyncStorage error (device settings), verify error banner + retry
5. **Performance**: Test with 200+ workouts, verify smooth scrolling
6. **Navigation**: Tap workout card, verify navigation to detail screen
7. **Dark Mode**: Toggle theme, verify empty state and error UI adapt

## Phase 0 Completion

All unknowns resolved. Ready for Phase 1 (data model, contracts, quickstart).
