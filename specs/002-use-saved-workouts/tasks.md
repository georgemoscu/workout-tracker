# Tasks: Display Saved Workouts on Home Screen

**Input**: Design documents from `/specs/002-use-saved-workouts/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: No tests required (constitution: no unit tests, manual testing only)

**Organization**: Tasks organized by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (No setup needed)

**Purpose**: Project infrastructure already exists from feature 001-workout-management

✅ **Skipped**: All dependencies, storage functions, and UI components already implemented

---

## Phase 2: Foundational (No foundational work needed)

**Purpose**: Core infrastructure for this feature

✅ **Skipped**: All required infrastructure exists:

- TanStack Query configured
- AsyncStorage with `getWorkoutIds()` and `getWorkoutById()` implemented
- WorkoutCard component available
- Type definitions in `lib/storage/types.ts`

**Checkpoint**: Foundation ready - user story implementation can begin immediately

---

## Phase 3: User Story 1 - View Completed Workout History (Priority: P1) 🎯 MVP

**Goal**: Display actual completed workouts from storage in reverse chronological order with pagination

**Independent Test**: Complete 3 workouts, return to home screen, verify 3 workout cards display with correct data (date, duration, exercises). Create 50 workouts and verify pagination loads 20 at a time with infinite scroll.

### Implementation for User Story 1

- [x] T001 [US1] Create `fetchWorkoutBatch` function in lib/hooks/useWorkouts.ts
- [x] T002 [US1] Remove hardcoded mock data (line 23) from app/index.tsx
- [x] T003 [US1] Add useInfiniteQuery hook for workouts in app/index.tsx
- [x] T004 [US1] Replace ScrollView with FlatList in app/index.tsx
- [x] T005 [US1] Add infinite scroll pagination with onEndReached in app/index.tsx
- [x] T006 [US1] Create EmptyWorkoutState component in app/index.tsx
- [x] T007 [US1] Add ListEmptyComponent for empty state in app/index.tsx
- [x] T008 [US1] Add ListFooterComponent for pagination loading indicator in app/index.tsx
- [x] T009 [US1] Add error recovery banner with retry button in app/index.tsx
- [x] T010 [US1] Add ActivityIndicator import from react-native in app/index.tsx

**Checkpoint**: User Story 1 complete - workout list displays real data with pagination and empty state

---

## Phase 4: User Story 2 - Navigate to Workout Details (Priority: P2)

**Goal**: Enable navigation from workout cards to detailed workout view

**Independent Test**: Tap any workout card in the list, verify navigation to workout detail screen with correct workout data. Navigate back, verify return to home screen with list intact.

### Implementation for User Story 2

- [x] T011 [US2] Verify WorkoutCard onPress handler navigates to /workout/[id] in components/WorkoutCard.tsx

**Checkpoint**: User Story 2 complete - navigation to workout details works (already implemented in WorkoutCard)

---

## Phase 5: User Story 3 - Performance with Large Workout History (Priority: P3)

**Goal**: Ensure smooth performance with hundreds of workouts through optimization

**Independent Test**: Create or load 200+ workouts. Measure home screen load time (<2s target). Scroll through entire list verifying smooth 60fps scrolling with no stuttering.

### Implementation for User Story 3

- [x] T012 [P] [US3] Add FlatList performance optimizations in app/index.tsx (removeClippedSubviews, windowSize)
- [x] T013 [P] [US3] Optimize keyExtractor to use workout.id in app/index.tsx
- [ ] T014 [US3] Test with 100 workouts and verify <2s load time
- [ ] T015 [US3] Test with 200+ workouts and verify smooth scrolling
- [ ] T016 [US3] Profile memory usage and verify <200MB with large dataset

**Checkpoint**: All user stories complete - performant workout history display with large datasets

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and validation

- [ ] T017 [P] Verify dark mode styling for all new UI elements (empty state, error banner, loading indicators)
- [ ] T018 [P] Test edge case: exactly 1 completed workout displays correctly
- [ ] T019 [P] Test edge case: corrupted workout data is skipped gracefully
- [ ] T020 [P] Test refetch on returning to home screen after completing workout
- [ ] T021 Manual testing checklist from quickstart.md (all scenarios)
- [ ] T022 Code cleanup: remove unused imports, add comments where needed
- [ ] T023 Update .github/agents/copilot-instructions.md if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Skipped - infrastructure exists
- **Foundational (Phase 2)**: ✅ Skipped - all dependencies ready
- **User Story 1 (Phase 3)**: Can start immediately - core feature
- **User Story 2 (Phase 4)**: Can start immediately - independent (already implemented)
- **User Story 3 (Phase 5)**: Depends on User Story 1 (T001-T010) - optimizes existing implementation
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - implements core functionality
  - Independent: Can be fully tested without US2 or US3
- **User Story 2 (P2)**: No dependencies - already implemented in WorkoutCard
  - Independent: Can be tested separately by tapping cards
- **User Story 3 (P3)**: Depends on US1 completion - adds performance optimizations
  - Independent: Can be tested by measuring performance metrics

### Within User Story 1 (Sequential Order)

1. T001: Create fetch function (foundation for data loading)
2. T002: Remove mock data (clears way for real data)
3. T003: Add useInfiniteQuery (core data fetching)
4. T004: Replace ScrollView with FlatList (enables virtualization)
5. T005: Add infinite scroll (pagination behavior)
6. T006-T007: Empty state (handles zero workouts case)
7. T008: Loading indicator (pagination UX)
8. T009: Error recovery (handles failures)
9. T010: Import cleanup (final touches)

### Within User Story 3 (Parallel Opportunities)

- T012, T013 can run in parallel (different optimizations)
- T014, T015, T016 must run sequentially (testing progression)

### Parallel Opportunities by Story

**User Story 1**: Most tasks sequential (building on previous work)
**User Story 2**: Single task (verification only)
**User Story 3**: T012 + T013 can run in parallel
**Polish Phase**: All tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Sequential execution (safest approach)
Task T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010

# If you MUST parallelize (after T001 complete):
# Branch 1: T002 → T003 (data layer)
# Branch 2: T006 → T007 (empty state UI)
# Then merge and continue: T004 → T005 → T008 → T009 → T010

# Recommendation: Work sequentially for this feature (small scope, ~2-3 hours total)
```

---

## Implementation Strategy

### MVP-First Approach

**Minimum Viable Product (MVP)**: User Story 1 only

- Tasks T001-T010 deliver core value: display real workouts
- Can ship to users after Phase 3 completion
- Estimated time: 2-3 hours

**Next Increment**: Add User Story 3 (performance)

- Tasks T012-T016 optimize for larger datasets
- Ship after testing with 100+ workouts
- Estimated time: 1 hour

**User Story 2**: Already complete (no work needed)

### Suggested Delivery Sequence

1. **Sprint 1**: Implement US1 (T001-T010) → Ship MVP
2. **Sprint 2**: Optimize for performance US3 (T012-T016) → Ship v1.1
3. **Sprint 3**: Polish phase (T017-T023) → Ship v1.2

### Testing After Each Story

**After US1** (T001-T010):

- ✅ Manual test: 0 workouts → empty state shows
- ✅ Manual test: 3 workouts → cards display correctly
- ✅ Manual test: 50 workouts → pagination works
- ✅ Manual test: Force error → retry button works

**After US3** (T012-T016):

- ✅ Performance test: 100 workouts → <2s load
- ✅ Performance test: 200 workouts → smooth scroll
- ✅ Memory test: No leaks with large dataset

**After Polish** (T017-T023):

- ✅ Complete checklist from quickstart.md
- ✅ Dark mode verification
- ✅ Edge case coverage

---

## Task Summary

**Total Tasks**: 23

- Setup: 0 (skipped)
- Foundational: 0 (skipped)
- User Story 1 (P1): 10 tasks
- User Story 2 (P2): 1 task (verification)
- User Story 3 (P3): 5 tasks
- Polish: 7 tasks

**Parallel Opportunities**:

- US3: 2 tasks can run in parallel (T012, T013)
- Polish: 6 tasks can run in parallel (T017-T020, T022, T023)
- Total parallelizable: 8 tasks (35%)

**Independent Test Criteria**:

- US1: Complete workout, return to home, verify display
- US2: Tap card, verify navigation, tap back
- US3: Load 200 workouts, measure performance

**Estimated Time**:

- US1: 2-3 hours
- US2: 5 minutes (verification)
- US3: 1 hour
- Polish: 30 minutes
- **Total: 3.5-4.5 hours**

**MVP Scope**: User Story 1 only (T001-T010) = 2-3 hours

---

## Format Validation ✅

All tasks follow required format:

- ✅ Checkbox: `- [ ]`
- ✅ Task ID: Sequential (T001, T002, ...)
- ✅ [P] marker: Present only for parallelizable tasks
- ✅ [Story] label: Present for all user story tasks (US1, US2, US3)
- ✅ Description: Includes clear action + file path
- ✅ No story label: Setup, Foundational, and Polish phases

**Examples**:

- ✅ `- [ ] T001 [US1] Create fetchWorkoutBatch function in lib/hooks/useWorkouts.ts`
- ✅ `- [ ] T012 [P] [US3] Add FlatList performance optimizations in app/index.tsx`
- ✅ `- [ ] T017 [P] Verify dark mode styling for all new UI elements`
