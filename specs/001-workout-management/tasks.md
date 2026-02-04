# Tasks: Workout Management System

**Branch**: `001-workout-management`
**Input**: Design documents from `/specs/001-workout-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Per constitution, NO unit tests will be written. Manual testing strategy documented in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Mobile single-project structure:

- **Screens**: `app/` (Expo Router file-based)
- **Components**: `components/`
- **Business Logic**: `lib/`
- **Constants**: `consts/`
- **Types**: `types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependencies installation

- [X] T001 Install TanStack Query packages: `@tanstack/react-query` and `@tanstack/react-query-persist-client`
- [X] T002 Install AsyncStorage: `@react-native-async-storage/async-storage`
- [X] T003 Install expo-notifications: `expo-notifications`
- [X] T004 [P] Create global TypeScript types file in types/index.ts
- [X] T005 [P] Update tailwind.config.js with dark red primary color theme (crimson #DC143C)
- [X] T006 [P] Create QueryClient configuration with AsyncStorage persistence in lib/queryClient.ts
- [X] T007 Update app/\_layout.tsx to wrap app with QueryClientProvider and theme provider

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 [P] Create muscle groups constants in consts/muscles.ts with MUSCLE_GROUPS array
- [X] T009 [P] Create gym machines constants in consts/machines.ts with GYM_MACHINES array
- [X] T010 [P] Create theme constants in consts/theme.ts for dark red color palette
- [X] T011 Create TypeScript interfaces for all entities in lib/storage/types.ts (Workout, Exercise, SetEntry, WorkoutPlan, PlannedExercise, UserSettings)
- [X] T012 Implement AsyncStorage operations in lib/storage/workoutStorage.ts (getActiveWorkout, saveActiveWorkout, completeWorkout, deleteActiveWorkout, getWorkoutById, updateWorkout, getWorkoutIds, getWorkoutCount)
- [X] T013 [P] Implement AsyncStorage operations in lib/storage/settingsStorage.ts (getSettings, saveSettings)
- [X] T014 [P] Implement workout plan storage operations in lib/storage/workoutStorage.ts (saveWorkoutPlan, getPlansByDay, getWorkoutPlanById, deleteWorkoutPlan)
- [X] T015 Create timer utility functions in lib/utils/timerUtils.ts (calculateDuration, formatTimer)
- [X] T016 [P] Create date utility functions in lib/utils/dateUtils.ts (formatDate, formatDuration)
- [X] T017 Create useTheme hook with context in lib/hooks/useTheme.ts for theme switching
- [X] T018 Implement theme provider component and integrate with app/\_layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Workout Start (Priority: P1) 🎯 MVP

**Goal**: Users can start a workout in maximum 2 taps with a running timer

**Independent Test**: Open app → tap "Start Workout" button → verify timer starts at 00:00 and screen navigates to active session

### Implementation for User Story 1

- [X] T019 [P] [US1] Create useActiveWorkout hook in lib/hooks/useActiveWorkout.ts with TanStack Query mutations for start/pause/resume/stop
- [X] T020 [P] [US1] Create WorkoutTimer component in components/WorkoutTimer.tsx with start/pause/resume/stop controls
- [X] T021 [US1] Create home screen in app/index.tsx with prominent "Start Workout" button (tap 1)
- [X] T022 [US1] Create active workout screen in app/start-workout.tsx with timer display (auto-navigates after tap 1)
- [X] T023 [US1] Implement workout start logic: create Workout with status='in-progress', save to workout:active
- [X] T024 [US1] Implement pause functionality: update pausedAt timestamp, preserve accumulatedTime
- [X] T025 [US1] Implement resume functionality: clear pausedAt, recalculate from timestamps
- [X] T026 [US1] Implement stop functionality: set status='completed', endTime, move to permanent storage
- [X] T027 [US1] Add navigation logic from home to start-workout screen on workout start
- [X] T028 [US1] Add navigation logic back to home screen when workout stops

**Checkpoint**: User Story 1 complete - Users can start, pause, resume, stop workouts with 2-tap requirement met

---

## Phase 4: User Story 2 - Exercise Logging During Workout (Priority: P2)

**Goal**: Users can log exercises with muscle groups, machines, and variable reps per set during active workout

**Independent Test**: Start workout → tap "Add Exercise" → select muscles, machine, add sets with different reps → save → verify exercise appears in workout list

### Implementation for User Story 2

- [ ] T029 [P] [US2] Create MuscleGroupPicker component in components/MuscleGroupPicker.tsx with multi-select chip UI
- [ ] T030 [P] [US2] Create MachinePicker component in components/MachinePicker.tsx with scrollable list
- [ ] T031 [P] [US2] Create SetInput component in components/SetInput.tsx for individual set rep entry with add/remove buttons
- [ ] T032 [US2] Create ExerciseForm component in components/ExerciseForm.tsx combining pickers and set inputs
- [ ] T033 [US2] Create ExerciseListItem component in components/ExerciseListItem.tsx to display exercise with all sets
- [ ] T034 [US2] Add "Add Exercise" button to app/start-workout.tsx screen
- [ ] T035 [US2] Implement exercise creation logic: generate Exercise with muscleGroups[], machine, sets[]
- [ ] T036 [US2] Implement dynamic set entry: add/remove SetEntry with reps and order
- [ ] T037 [US2] Implement exercise save: push Exercise to workout.exercises array, update workout:active
- [ ] T038 [US2] Display exercises list in active workout screen with ExerciseListItem components
- [ ] T039A [US2] Implement remove exercise from active workout: add delete button to ExerciseListItem, remove from exercises array, update workout:active
- [ ] T039 [US2] Add validation: minimum 1 muscle group, minimum 1 set, maximum 20 sets, reps > 0

**Checkpoint**: User Story 2 complete - Users can log exercises with full details during workouts

---

## Phase 5: User Story 3 - Workout History & Editing (Priority: P3)

**Goal**: Users can view past workouts and edit any workout details after completion

**Independent Test**: Complete 3 workouts → navigate to history → select workout → tap edit → modify exercise → save → verify changes persist

### Implementation for User Story 3

- [ ] T040 [P] [US3] Create useWorkouts hook in lib/hooks/useWorkouts.ts with TanStack Query infinite query for pagination
- [ ] T041 [P] [US3] Create WorkoutCard component in components/WorkoutCard.tsx to display workout summary (date, duration, exercise count)
- [ ] T042 [US3] Create workout history screen in app/history/index.tsx with paginated FlatList
- [ ] T043 [US3] Implement workout history loading: use getWorkoutIds with pagination, lazy load workouts
- [ ] T044 [US3] Create workout detail screen in app/history/[id].tsx to display full workout with all exercises and sets
- [ ] T045 [US3] Add edit mode toggle in workout detail screen
- [ ] T046 [US3] Make all workout fields editable in edit mode (exercises, sets, reps, muscle groups, machines)
- [ ] T047 [US3] Implement workout update logic: call updateWorkout with modified data, persist to AsyncStorage
- [ ] T048 [US3] Allow adding new exercise to past workout in edit mode
- [ ] T049 [US3] Allow removing exercise from past workout in edit mode
- [ ] T050 [US3] Add navigation from history list to workout detail screen
- [ ] T051 [US3] Implement optimistic updates with TanStack Query for instant UI feedback

**Checkpoint**: User Story 3 complete - Users can review and edit workout history

---

## Phase 6: User Story 4 - Workout Planning (Priority: P4)

**Goal**: Users can create workout templates for specific days and start workouts from plans

**Independent Test**: Navigate to plan screen → select Monday → create plan with exercises → save → verify plan appears → start workout from plan → verify exercises copied as template

### Implementation for User Story 4

- [ ] T052 [P] [US4] Create PlannedExerciseForm component in components/PlannedExerciseForm.tsx with targetSets and targetReps fields
- [ ] T053 [P] [US4] Create WeekCalendar component in components/WeekCalendar.tsx to display days with plan indicators
- [ ] T054 [US4] Create workout planning screen in app/plan-workout.tsx with weekly calendar view
- [ ] T055 [US4] Implement day selection in calendar: highlight selected day, show plans for that day
- [ ] T056 [US4] Create workout plan form: name input, day selection, planned exercises list
- [ ] T057 [US4] Implement plan save logic: call saveWorkoutPlan, persist to plan:{id}, update plans:byDay:{day} index
- [ ] T058 [US4] Display existing plans for selected day in list format
- [ ] T059 [US4] Implement "Start from Plan" functionality: copy PlannedExercise to Exercise (clear sets array)
- [ ] T060 [US4] Add plan cards to home screen (app/index.tsx) showing today's plans with quick-start button
- [ ] T061 [US4] Implement plan deletion: remove from storage, update index
- [ ] T062 [US4] Allow editing existing workout plans

**Checkpoint**: User Story 4 complete - Users can plan workouts and start from templates

---

## Phase 7: User Story 5 - Theme Customization (Priority: P5)

**Goal**: Users can switch between dark and light themes with dark red accents, theme persists across sessions

**Independent Test**: Navigate to settings → toggle theme → verify immediate UI update → close app → reopen → verify theme persists

### Implementation for User Story 5

- [ ] T063 [P] [US5] Create ThemeToggle component in components/ThemeToggle.tsx with switch UI
- [ ] T064 [US5] Create settings screen in app/settings/index.tsx with theme toggle
- [ ] T065 [US5] Implement theme switching logic in useTheme hook: toggle between 'light' and 'dark'
- [ ] T066 [US5] Apply dark class to root element based on theme context
- [ ] T067 [US5] Ensure all screens use Tailwind classes with dark: variants (bg-white dark:bg-gray-900, text-gray-900 dark:text-white)
- [ ] T068 [US5] Ensure all components use text-primary-600 dark:text-primary-400 for accent color
- [ ] T069 [US5] Implement theme persistence: save to settings:preferences on change, load on app launch
- [ ] T070 [US5] Add theme toggle to settings screen with current theme indicator
- [ ] T071 [US5] Verify theme updates across all screens without disrupting active workout

**Checkpoint**: User Story 5 complete - Users can customize theme with full persistence

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Force-close recovery, notifications, error handling, performance optimizations

- [ ] T072 Implement force-close recovery modal: check workout:active on app launch, show Resume/Discard options
- [ ] T073 Implement recovery resume: load incomplete workout into active session, restore timer state
- [ ] T074 Implement recovery discard: call deleteActiveWorkout, clear workout:active
- [ ] T075 Implement 3-hour notification using useNotification hook in lib/hooks/useNotification.ts (request expo-notifications permissions on first workout start or in settings screen)
- [ ] T076 Register background task with expo-background-fetch to check workout duration
- [ ] T077 Trigger local notification at 3-hour mark using expo-notifications
- [ ] T078 Add error handling to all AsyncStorage operations with console.error logging
- [ ] T079 Implement workout blocking: prevent starting new workout when one is in progress, show alert
- [ ] T080 Add loading states to all async operations (workout save, history load, plan load)
- [ ] T081 Optimize FlatList in history screen with getItemLayout for fixed-height items
- [ ] T082 Implement throttled auto-save for active workout (every 5 seconds instead of every change)
- [ ] T083 Add empty states for history screen (no workouts yet), plan screen (no plans yet)
- [ ] T084 Add confirmation dialogs for destructive actions (delete plan, discard workout)
- [ ] T085 Polish UI with consistent spacing, typography, and dark red accent usage
- [ ] T086 Add haptic feedback for button presses using expo-haptics
- [ ] T087 Ensure all text inputs have proper keyboard types (numeric for reps, default for notes)
- [ ] T088 Add workout summary on stop: show total duration, exercises completed, total sets
- [ ] T089 Implement pull-to-refresh on history screen to reload workouts
- [ ] T090 Add workout count badge to history tab icon

**Checkpoint**: All polish tasks complete - App is production-ready

---

## Dependencies & Execution Order

### Story Completion Order (with rationale)

1. **Phase 1 & 2 (Setup & Foundation)** → MUST complete first (blocking)
2. **User Story 1** → Core MVP, enables workout tracking
3. **User Story 2** → Adds substance to workouts, depends on US1
4. **User Story 3** → Depends on US1 & US2 (needs completed workouts)
5. **User Story 4** → Independent from US1-3 (planning can be built separately)
6. **User Story 5** → Completely independent (theming is orthogonal)
7. **Phase 8 (Polish)** → Applies across all stories, best done last

### Dependency Graph

```
Setup (Phase 1)
    ↓
Foundation (Phase 2) ← Must complete before user stories
    ↓
    ├─→ US1 (Quick Start) ← MVP
    │      ↓
    ├─→ US2 (Exercise Logging) ← Depends on US1
    │      ↓
    ├─→ US3 (History & Editing) ← Depends on US1 + US2
    │
    ├─→ US4 (Planning) ← Independent, can parallel with US3
    │
    └─→ US5 (Theme) ← Independent, can parallel with US1-4
           ↓
    Polish (Phase 8) ← Cross-cutting, depends on all user stories
```

### Parallel Execution Opportunities

**After Foundation Complete**:

- US1 tasks T019-T020 can run in parallel
- US2 component tasks T029-T031 can run in parallel
- US4 can start while US3 is in progress (independent features)
- US5 can start anytime after Foundation (completely independent)

**Within Each Story**:

- US1: T019 (hook) + T020 (timer component) parallel
- US2: T029 (muscle picker) + T030 (machine picker) + T031 (set input) parallel
- US3: T040 (hook) + T041 (card component) parallel
- US4: T052 (form) + T053 (calendar) parallel
- US5: T063 (toggle component) parallel with T067-T068 (styling updates)

**Example Parallel Sprint**:

- Developer A: T019, T020, T021 (US1 - home + timer)
- Developer B: T029, T030, T031 (US2 - pickers)
- Developer C: T052, T053 (US4 - planning components)
- Developer D: T063, T067, T068 (US5 - theming)

---

## Implementation Strategy

### MVP Definition (Minimum Viable Product)

**MVP = User Story 1 + User Story 2** (Tasks T001-T039)

This delivers:

- ✅ 2-tap workout start
- ✅ Timer with pause/resume/stop
- ✅ Exercise logging with muscle groups, machines, sets/reps
- ✅ Basic data persistence

**Why this is viable**: Users can track workouts immediately with full exercise detail. History/planning/theming are enhancements.

### Incremental Delivery Approach

**Sprint 1** (MVP): Phase 1, 2, US1, US2 → Functional workout tracker
**Sprint 2**: US3 → Adds history and editing capability
**Sprint 3**: US4 → Adds workout planning
**Sprint 4**: US5 + Phase 8 → Polish, theming, recovery, notifications

### Testing Checkpoints (Manual)

After each user story phase, perform manual testing per quickstart.md checklist:

**US1 Checkpoint**:

- [ ] Launch app, tap Start Workout, verify timer starts
- [ ] Verify 2-tap requirement met (app launch → button tap)
- [ ] Test pause/resume/stop cycle

**US2 Checkpoint**:

- [ ] Add exercise with multiple muscle groups
- [ ] Add multiple sets with different reps (10, 8, 12)
- [ ] Verify exercise saved correctly

**US3 Checkpoint**:

- [ ] View workout history (create 10+ workouts first)
- [ ] Open workout detail, enter edit mode
- [ ] Modify exercise, verify persists after save

**US4 Checkpoint**:

- [ ] Create plan for Monday with 3 exercises
- [ ] Start workout from plan, verify template copied
- [ ] Verify plan persists across app restarts

**US5 Checkpoint**:

- [ ] Toggle theme in settings
- [ ] Verify all screens update immediately
- [ ] Close/reopen app, verify theme persists

**Phase 8 Checkpoint**:

- [ ] Force-close app during workout, verify recovery modal
- [ ] Start 3-hour+ workout (or mock timer), verify notification
- [ ] Try starting second workout while one active, verify blocked

---

## Task Summary

| Phase                  | Task Range | Count        | Parallelizable   |
| ---------------------- | ---------- | ------------ | ---------------- |
| Setup                  | T001-T007  | 7            | 4 tasks          |
| Foundation             | T008-T018  | 11           | 5 tasks          |
| US1 (Quick Start)      | T019-T028  | 10           | 2 tasks          |
| US2 (Exercise Logging) | T029-T039  | 11           | 3 tasks          |
| US3 (History & Edit)   | T040-T051  | 12           | 2 tasks          |
| US4 (Planning)         | T052-T062  | 11           | 2 tasks          |
| US5 (Theme)            | T063-T071  | 9            | 3 tasks          |
| Polish                 | T072-T090  | 19           | Some tasks       |
| **TOTAL**              | T001-T090, T039A  | **91 tasks** | **21+ parallel** |

---

## Suggested MVP Scope

**Recommended First Release**: Phases 1, 2, 3, 4 (T001-T039)

- Total: 39 tasks
- Delivery: Fully functional workout tracker with timer and exercise logging
- Value: Users can immediately start tracking workouts with detailed exercise data

**Next Release**: Add Phase 5 (US3 - History)
**Future Releases**: Phases 6, 7, 8 (Planning, Theming, Polish)

---

**Tasks Generated**: 91
**Organization**: By User Story (enables independent implementation)
**Tests**: None (per constitution)
**Manual Testing**: See quickstart.md

**Ready for Implementation** ✅
