// TypeScript interfaces for storage entities
import type { GymMachine } from "@/consts/machines";
import type { MuscleGroup } from "@/consts/muscles";

export type WorkoutStatus = "in-progress" | "completed" | "incomplete";
export type ThemeMode = "light" | "dark";

// SetEntry: Individual set within an exercise
export interface SetEntry {
  id: string;
  reps: number;
  order: number;
  weight: number | null; // Future enhancement, null for MVP
}

// Exercise: Single exercise performed during a workout
export interface Exercise {
  id: string;
  muscleGroups: MuscleGroup[];
  machine: GymMachine;
  sets: SetEntry[];
  order: number;
  createdAt: number;
  notes: string | null;
}

// Workout: Training session with timer tracking
export interface Workout {
  id: string;
  startTime: number;
  endTime: number | null;
  pausedAt: number | null;
  accumulatedTime: number;
  status: WorkoutStatus;
  exercises: Exercise[];
  createdAt: number;
  updatedAt: number;
}

// PlannedExercise: Template exercise within a workout plan
export interface PlannedExercise {
  id: string;
  muscleGroups: MuscleGroup[];
  machine: GymMachine;
  targetSets: number;
  targetReps: number;
  order: number;
  notes: string | null;
}

// WorkoutPlan: Template for planned workouts
export interface WorkoutPlan {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday=0, Monday=1, ..., Saturday=6)
  name: string;
  plannedExercises: PlannedExercise[];
  createdAt: number;
  updatedAt: number;
}

// UserSettings: User preferences
export interface UserSettings {
  theme: ThemeMode;
  notifications: boolean;
}
