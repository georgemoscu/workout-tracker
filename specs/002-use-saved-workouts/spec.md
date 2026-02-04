# Feature Specification: Display Saved Workouts on Home Screen

**Feature Branch**: `002-use-saved-workouts`  
**Created**: February 4, 2026  
**Status**: Draft  
**Input**: User description: "app/index.tsx bug - This file has a custom workouts creation. Take the saved workouts instead"

## Clarifications

### Session 2026-02-04

- Q: When the user has zero completed workouts, what should the empty state display? → A: Combination of friendly message with call-to-action and motivational graphic/illustration with encouraging text
- Q: When workout data fails to load from storage, what specific error recovery mechanism should be provided? → A: Show error message with "Retry" button and fallback to "Start New Workout" option
- Q: How should additional workouts load when the user has more than 20 completed workouts? → A: Automatic infinite scroll with loading indicator at bottom
- Q: What information should each workout card display as summary data? → A: Date, duration, exercise count, and first 2 exercises preview

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Completed Workout History (Priority: P1)

Users need to see their actual completed workouts on the home screen instead of placeholder data, so they can track their fitness progress, review past workout details, and maintain workout history.

**Why this priority**: This is the core functionality of the feature - displaying real workout data is essential for the app's purpose. Without this, users cannot access their workout history at all.

**Independent Test**: Can be fully tested by completing at least one workout, returning to the home screen, and verifying that the completed workout appears in the workout list with correct details (date, exercises, duration).

**Acceptance Scenarios**:

1. **Given** a user has completed 3 workouts, **When** they open the home screen, **Then** they see 3 workout cards displaying their actual workout data
2. **Given** a user has no completed workouts, **When** they open the home screen, **Then** they see an empty state message or no workout cards
3. **Given** a user has 50 completed workouts, **When** they scroll the workout list, **Then** workouts are displayed in reverse chronological order (newest first)

---

### User Story 2 - Navigate to Workout Details (Priority: P2)

Users want to tap on a workout card to view detailed information about that specific workout session, including exercises performed, sets, reps, and weights used.

**Why this priority**: After viewing the list of workouts, users need to access individual workout details to review their performance and track progress over time.

**Independent Test**: Can be fully tested by tapping on any workout card in the list and verifying navigation to a workout detail view with the correct workout data loaded.

**Acceptance Scenarios**:

1. **Given** a user sees their workout list, **When** they tap on a workout card, **Then** they are navigated to the workout detail screen showing that workout's complete information
2. **Given** a user is viewing workout details, **When** they navigate back, **Then** they return to the home screen with the workout list still visible

---

### User Story 3 - Performance with Large Workout History (Priority: P3)

Users with extensive workout histories need the home screen to load quickly and scroll smoothly, even when they have hundreds of completed workouts.

**Why this priority**: While important for user experience, this is lower priority than basic functionality. Initial implementation can work with reasonable limits, and optimization can be added later if needed.

**Independent Test**: Can be tested by creating or loading 100+ workouts and measuring home screen load time and scroll performance. Success means smooth scrolling with no noticeable lag.

**Acceptance Scenarios**:

1. **Given** a user has 100 completed workouts, **When** they open the home screen, **Then** the screen loads within 2 seconds
2. **Given** a user has 200 completed workouts, **When** they scroll through the workout list, **Then** scrolling is smooth with no frame drops or stuttering
3. **Given** a user has 500 completed workouts, **When** they scroll near the bottom of the current batch, **Then** a loading indicator appears and additional workouts load automatically (infinite scroll)

---

### Edge Cases

- What happens when the user has zero completed workouts? (Display motivational graphic/illustration with friendly message "No workouts yet. Start your first workout!" and a visible call-to-action)
- How does the system handle corrupted workout data in storage? (Skip invalid entries and log error)
- What happens if workout data fails to load from storage? (Display error message with "Retry" button and fallback "Start New Workout" option)
- How are workouts displayed when the user has exactly one completed workout? (Single workout card displayed correctly)
- What happens if a workout is deleted while the user is viewing the list? (List updates automatically or refreshes on focus)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST retrieve completed workouts from persistent storage when the home screen loads
- **FR-002**: System MUST display workout cards in reverse chronological order (most recent first)
- **FR-003**: System MUST show workout card summary data including date, duration, exercise count, and preview of first 2 exercises for each workout
- **FR-004**: System MUST handle loading states while fetching workout data from storage
- **FR-005**: System MUST support automatic infinite scroll with loading indicator at bottom when displaying large workout histories (loads 20 workouts per batch, triggers next batch when user scrolls near bottom)
- **FR-006**: System MUST remove the hardcoded mock workout data from the home screen component
- **FR-007**: System MUST display an empty state with motivational graphic/illustration, friendly message ("No workouts yet. Start your first workout!"), and call-to-action when no completed workouts exist
- **FR-008**: System MUST enable users to tap on workout cards to navigate to detailed workout views
- **FR-009**: System MUST refresh workout list when returning to home screen after completing a workout
- **FR-010**: System MUST handle storage errors gracefully by displaying an error message with a "Retry" button and fallback "Start New Workout" option, without crashing the application

### Key Entities

- **Completed Workout**: Represents a finished workout session with status='completed', including exercises performed, start/end times, total duration, and unique identifier
- **Workout Card**: Display component showing summary information for a single workout in the home screen list, including date, duration, exercise count, and preview of first 2 exercises

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users see their actual completed workouts instead of placeholder data 100% of the time when workouts exist in storage
- **SC-002**: Home screen loads and displays workout list within 2 seconds for users with up to 100 completed workouts
- **SC-003**: Workout list displays in correct chronological order (newest first) for 100% of users
- **SC-004**: Users can successfully navigate to workout details by tapping on workout cards in the list
- **SC-005**: Zero crashes or application errors when loading workout history, including edge cases like empty storage or corrupted data
- **SC-006**: Home screen displays empty state with motivational graphic, friendly message, and call-to-action when users have zero completed workouts

## Scope

### In Scope

- Replacing hardcoded mock workout data with real workout data from storage
- Implementing query to fetch completed workouts from `workoutStorage`
- Displaying workout cards with actual workout information (date, duration, exercises)
- Handling loading states during data fetch
- Implementing empty state for users with no workouts
- Pagination or limiting initial load to 20 workouts for performance
- Error handling for storage failures

### Out of Scope

- Modifying the WorkoutCard component's visual design (unless necessary for displaying real data)
- Adding workout deletion functionality from the home screen
- Implementing workout filtering or search features
- Adding workout statistics or analytics
- Modifying workout storage schema or data structure
- Creating new workout detail views (assumes existing detail route works)

## Assumptions

- The `workoutStorage` module provides functions to retrieve completed workouts (`getWorkoutIds()` and `getWorkoutById()`)
- The `WorkoutCard` component can accept and display actual workout objects instead of simple strings
- A workout detail route already exists at `/workout/[id]` for navigation
- Pagination limit of 20 workouts per initial load is sufficient for most users
- Workout data structure includes all necessary fields for display (id, date, duration, exercises, status)
- The existing query client setup supports React Query for data fetching

## Dependencies

- Existing `workoutStorage` module must provide completed workout retrieval functions
- `WorkoutCard` component must be compatible with workout object data structure
- React Query (`@tanstack/react-query`) must be available for data fetching
- Workout detail screen must be implemented at `/workout/[id]` route
