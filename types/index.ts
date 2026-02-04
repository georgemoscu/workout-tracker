// Global TypeScript types for Workout Tracker

export type WorkoutStatus = 'in-progress' | 'completed' | 'incomplete';
export type ThemeMode = 'light' | 'dark';

// Re-export types from consts
export type { MuscleGroup } from '../consts/muscles';
export type { GymMachine } from '../consts/machines';

// Entity types (detailed definitions in lib/storage/types.ts)
export type {
  Workout,
  Exercise,
  SetEntry,
  WorkoutPlan,
  PlannedExercise,
  UserSettings,
} from '../lib/storage/types';
