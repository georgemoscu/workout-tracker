# Implementation Plan: Display Saved Workouts on Home Screen

**Branch**: `002-use-saved-workouts` | **Date**: 2026-02-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-use-saved-workouts/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace hardcoded mock workout data in `app/index.tsx` with actual completed workouts from AsyncStorage. Implement infinite scroll pagination (20 workouts per batch), empty state with motivational graphic, and error recovery with retry mechanism. Use existing TanStack Query for data fetching and WorkoutCard component for display.

## Technical Context

**Language/Version**: TypeScript (strict mode), React 19.1.0, React Native 0.81.5  
**Primary Dependencies**: Expo ~54, TanStack React Query v5, @react-native-async-storage/async-storage v2.2  
**Storage**: AsyncStorage (key-value store with JSON serialization)  
**Testing**: Manual testing (constitution: no unit tests)  
**Target Platform**: iOS/Android via Expo (React Native mobile)  
**Project Type**: Mobile (Expo Router file-based routing)  
**Performance Goals**: Home screen load <2s for 100 workouts, smooth scrolling at 60fps  
**Constraints**: Offline-first (no network), <200MB memory, infinite scroll UX  
**Scale/Scope**: Handle 500+ workouts, paginated display (20 per batch), 1 screen modification

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Initial Check (Before Phase 0) ✅

✅ **Readability First**

- Descriptive naming for queries (`useCompletedWorkouts`, `fetchWorkoutBatch`)
- Single responsibility: separate hooks for data fetching vs. pagination logic
- Self-documenting component structure (no complex abstractions)

✅ **Maintainability & Simplicity**

- YAGNI: Reusing existing WorkoutCard component, no new UI components unless required
- No new dependencies (TanStack Query and AsyncStorage already in place)
- Simple infinite scroll via FlatList `onEndReached` (built-in React Native pattern)
- Straightforward state: offset tracking for pagination only

✅ **No Unit Testing**

- Manual testing on device for workout list display
- User validation: test with 0, 1, 20, 100+ workouts
- Visual verification of empty state, loading states, error handling

### Post-Design Check (After Phase 1) ✅

**Design Review Against Constitution**:

✅ **Readability First** - PASSING

- Function names clearly communicate purpose: `fetchWorkoutBatch`, `EmptyWorkoutState`
- Single responsibility maintained: data fetching in hooks, UI in components
- No clever abstractions: straightforward FlatList + useInfiniteQuery pattern
- Comments minimal and focused on "why" (e.g., error handling rationale)

✅ **Maintainability & Simplicity** - PASSING

- YAGNI enforced: Empty state uses existing Lucide icons (no new assets)
- Component hierarchy shallow: EmptyWorkoutState is simple functional component
- State management predictable: TanStack Query handles pagination state
- Reusing WorkoutCard component without modifications
- No new dependencies added

✅ **No Unit Testing** - PASSING

- Quickstart.md provides comprehensive manual testing checklist
- Testing focuses on user scenarios: empty state, pagination, error recovery
- Performance validated through hands-on device testing (not automated)
- No test files or frameworks introduced

**Design Concerns Addressed**:

- Initially considered skeleton screens → Rejected per YAGNI (simple spinner sufficient)
- Initially considered custom pagination library → Rejected (FlatList built-in sufficient)
- Initially considered complex error boundary → Rejected (inline error banner simpler)

**Verdict**: All constitutional principles upheld. Design is simple, readable, and maintainable. Ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/002-use-saved-workouts/
├── plan.md              # This file
├── research.md          # Phase 0: No new research needed (reusing existing patterns)
├── data-model.md        # Phase 1: No new entities (using existing Workout model)
├── quickstart.md        # Phase 1: Developer guide for this feature
├── contracts/           # Phase 1: Storage API contracts (reference existing)
└── tasks.md             # Phase 2: NOT created by /speckit.plan
```

### Source Code (repository root)

```text
app/
├── index.tsx            # MODIFIED: Replace mock data with real workouts
├── workout/
│   └── [id].tsx         # EXISTS: Workout detail screen (navigation target)
├── start-workout.tsx    # EXISTS: Referenced by navigation
└── ...

components/
├── WorkoutCard.tsx      # EXISTS: Reused for workout display
└── ...

lib/
├── storage/
│   ├── workoutStorage.ts    # EXISTS: getWorkoutIds(), getWorkoutById()
│   └── types.ts             # EXISTS: Workout type definition
└── hooks/
    └── useWorkouts.ts       # MODIFIED: Add pagination support
```

**Structure Decision**: Mobile app with Expo Router file-based routing. Only modifying `app/index.tsx` and potentially `lib/hooks/useWorkouts.ts` for pagination. All other components and storage utilities already exist from feature 001-workout-management.

## Complexity Tracking

No constitutional violations. This feature adds minimal complexity:

- Reuses existing storage APIs and components
- Uses standard React Native FlatList for infinite scroll
- No new dependencies or architectural patterns

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
