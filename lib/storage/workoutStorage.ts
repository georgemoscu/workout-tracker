// Workout storage operations with AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Workout, WorkoutPlan } from "./types";

// Storage keys
const KEYS = {
  ACTIVE_WORKOUT: "workout:active",
  WORKOUT_IDS: "workouts:ids",
  workout: (id: string) => `workout:${id}`,
  plan: (id: string) => `plan:${id}`,
  plansByDay: (day: number) => `plans:byDay:${day}`,
};

// ============================================================================
// Active Workout Operations
// ============================================================================

export async function getActiveWorkout(): Promise<Workout | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ACTIVE_WORKOUT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error getting active workout:", error);
    return null;
  }
}

export async function saveActiveWorkout(workout: Workout): Promise<void> {
  try {
    if (!["in-progress", "incomplete"].includes(workout.status)) {
      throw new Error(
        "saveActiveWorkout: status must be in-progress or incomplete",
      );
    }
    await AsyncStorage.setItem(KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
  } catch (error) {
    console.error("Error saving active workout:", error);
    throw error;
  }
}

export async function deleteActiveWorkout(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.ACTIVE_WORKOUT);
  } catch (error) {
    console.error("Error deleting active workout:", error);
  }
}

export async function completeWorkout(workout: Workout): Promise<string> {
  try {
    // Generate new UUID for completed workout
    const newId = `workout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Update workout status
    const completedWorkout: Workout = {
      ...workout,
      id: newId,
      status: "completed",
      endTime: Date.now(),
      updatedAt: Date.now(),
    };

    // Save to permanent storage
    await AsyncStorage.setItem(
      KEYS.workout(newId),
      JSON.stringify(completedWorkout),
    );

    // Update workout IDs index (prepend - newest first)
    const idsData = await AsyncStorage.getItem(KEYS.WORKOUT_IDS);
    const ids: string[] = idsData ? JSON.parse(idsData) : [];
    ids.unshift(newId);
    await AsyncStorage.setItem(KEYS.WORKOUT_IDS, JSON.stringify(ids));

    // Remove active workout
    await deleteActiveWorkout();

    return newId;
  } catch (error) {
    console.error("Error completing workout:", error);
    throw error;
  }
}

// ============================================================================
// Workout CRUD Operations
// ============================================================================

export async function getWorkoutById(id: string): Promise<Workout | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.workout(id));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting workout ${id}:`, error);
    return null;
  }
}

export async function updateWorkout(
  id: string,
  workout: Workout,
): Promise<void> {
  try {
    const exists = await getWorkoutById(id);
    if (!exists) {
      throw new Error(`Workout ${id} does not exist`);
    }

    const updatedWorkout: Workout = {
      ...workout,
      updatedAt: Date.now(),
    };

    await AsyncStorage.setItem(
      KEYS.workout(id),
      JSON.stringify(updatedWorkout),
    );
  } catch (error) {
    console.error(`Error updating workout ${id}:`, error);
    throw error;
  }
}

export async function getWorkoutIds(
  offset: number = 0,
  limit: number = 20,
): Promise<string[]> {
  try {
    const maxLimit = Math.min(limit, 100);
    const data = await AsyncStorage.getItem(KEYS.WORKOUT_IDS);
    const ids: string[] = data ? JSON.parse(data) : [];

    return ids.slice(offset, offset + maxLimit);
  } catch (error) {
    console.error("Error getting workout IDs:", error);
    return [];
  }
}

export async function getWorkoutCount(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WORKOUT_IDS);
    const ids: string[] = data ? JSON.parse(data) : [];
    return ids.length;
  } catch (error) {
    console.error("Error getting workout count:", error);
    return 0;
  }
}

// ============================================================================
// Workout Plan Operations
// ============================================================================

export async function saveWorkoutPlan(plan: WorkoutPlan): Promise<void> {
  try {
    // Save plan to storage
    await AsyncStorage.setItem(KEYS.plan(plan.id), JSON.stringify(plan));

    // Update day index
    const dayKey = KEYS.plansByDay(plan.dayOfWeek);
    const data = await AsyncStorage.getItem(dayKey);
    const planIds: string[] = data ? JSON.parse(data) : [];

    if (!planIds.includes(plan.id)) {
      planIds.push(plan.id);
      await AsyncStorage.setItem(dayKey, JSON.stringify(planIds));
    }
  } catch (error) {
    console.error("Error saving workout plan:", error);
    throw error;
  }
}

export async function getPlansByDay(dayOfWeek: number): Promise<WorkoutPlan[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.plansByDay(dayOfWeek));
    const planIds: string[] = data ? JSON.parse(data) : [];

    const plans = await Promise.all(
      planIds.map(async (id) => {
        const planData = await AsyncStorage.getItem(KEYS.plan(id));
        return planData ? JSON.parse(planData) : null;
      }),
    );

    return plans.filter((plan): plan is WorkoutPlan => plan !== null);
  } catch (error) {
    console.error(`Error getting plans for day ${dayOfWeek}:`, error);
    return [];
  }
}

export async function getWorkoutPlanById(
  id: string,
): Promise<WorkoutPlan | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.plan(id));
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting plan ${id}:`, error);
    return null;
  }
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  try {
    // Get plan to find its day
    const plan = await getWorkoutPlanById(id);
    if (!plan) return;

    // Remove from day index
    const dayKey = KEYS.plansByDay(plan.dayOfWeek);
    const data = await AsyncStorage.getItem(dayKey);
    const planIds: string[] = data ? JSON.parse(data) : [];
    const updatedIds = planIds.filter((planId) => planId !== id);
    await AsyncStorage.setItem(dayKey, JSON.stringify(updatedIds));

    // Remove plan
    await AsyncStorage.removeItem(KEYS.plan(id));
  } catch (error) {
    console.error(`Error deleting plan ${id}:`, error);
    throw error;
  }
}
