// Timer utility functions
import type { Workout } from "../storage/types";

/**
 * Calculate total duration of a workout in seconds
 * Accounts for paused time and current status
 */
export function calculateDuration(workout: Workout): number {
  const { startTime, endTime, pausedAt, accumulatedTime } = workout;

  if (workout.status === "completed") {
    // For completed workouts, use accumulated time
    return accumulatedTime;
  }

  if (pausedAt) {
    // If paused, return accumulated time (frozen at pause)
    return accumulatedTime;
  }

  // If running, calculate current duration
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  return accumulatedTime + elapsed;
}

/**
 * Format seconds into MM:SS or HH:MM:SS format
 */
export function formatTimer(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Update accumulated time when pausing a workout
 */
export function calculateAccumulatedTime(workout: Workout): number {
  if (workout.pausedAt) {
    // Already paused, return current accumulated time
    return workout.accumulatedTime;
  }

  // Calculate elapsed since start
  const elapsed = Math.floor((Date.now() - workout.startTime) / 1000);
  return workout.accumulatedTime + elapsed;
}
