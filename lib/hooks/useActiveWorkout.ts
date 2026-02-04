// Active workout hook with TanStack Query mutations
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Workout } from "../storage/types";
import {
  completeWorkout,
  deleteActiveWorkout,
  getActiveWorkout,
  saveActiveWorkout,
} from "../storage/workoutStorage";
import { calculateAccumulatedTime } from "../utils/timerUtils";

const ACTIVE_WORKOUT_KEY = ["workout", "active"];

export function useActiveWorkout() {
  const queryClient = useQueryClient();

  // Query for active workout
  const { data: activeWorkout, isLoading } = useQuery({
    queryKey: ACTIVE_WORKOUT_KEY,
    queryFn: getActiveWorkout,
    staleTime: Infinity,
  });

  // Mutation to start a new workout
  const startWorkout = useMutation({
    mutationFn: async () => {
      const newWorkout: Workout = {
        id: `temp-${Date.now()}`,
        startTime: Date.now(),
        endTime: null,
        pausedAt: null,
        accumulatedTime: 0,
        status: "in-progress",
        exercises: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await saveActiveWorkout(newWorkout);
      return newWorkout;
    },
    onSuccess: (workout) => {
      queryClient.setQueryData(ACTIVE_WORKOUT_KEY, workout);
    },
  });

  // Mutation to pause workout
  const pauseWorkout = useMutation({
    mutationFn: async (workout: Workout) => {
      const accumulated = calculateAccumulatedTime(workout);
      const pausedWorkout: Workout = {
        ...workout,
        pausedAt: Date.now(),
        accumulatedTime: accumulated,
        updatedAt: Date.now(),
      };
      await saveActiveWorkout(pausedWorkout);
      return pausedWorkout;
    },
    onSuccess: (workout) => {
      queryClient.setQueryData(ACTIVE_WORKOUT_KEY, workout);
    },
  });

  // Mutation to resume workout
  const resumeWorkout = useMutation({
    mutationFn: async (workout: Workout) => {
      const resumedWorkout: Workout = {
        ...workout,
        startTime: Date.now(),
        pausedAt: null,
        updatedAt: Date.now(),
      };
      await saveActiveWorkout(resumedWorkout);
      return resumedWorkout;
    },
    onSuccess: (workout) => {
      queryClient.setQueryData(ACTIVE_WORKOUT_KEY, workout);
    },
  });

  // Mutation to stop and complete workout
  const stopWorkout = useMutation({
    mutationFn: async (workout: Workout) => {
      const accumulated = calculateAccumulatedTime(workout);
      const workoutToComplete: Workout = {
        ...workout,
        accumulatedTime: accumulated,
        pausedAt: null,
      };
      const workoutId = await completeWorkout(workoutToComplete);
      return workoutId;
    },
    onSuccess: () => {
      queryClient.setQueryData(ACTIVE_WORKOUT_KEY, null);
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  // Mutation to update active workout (e.g., add exercise)
  const updateActive = useMutation({
    mutationFn: async (workout: Workout) => {
      const updatedWorkout: Workout = {
        ...workout,
        updatedAt: Date.now(),
      };
      await saveActiveWorkout(updatedWorkout);
      return updatedWorkout;
    },
    onSuccess: (workout) => {
      queryClient.setQueryData(ACTIVE_WORKOUT_KEY, workout);
    },
  });

  // Mutation to discard active workout (recovery)
  const discardWorkout = useMutation({
    mutationFn: deleteActiveWorkout,
    onSuccess: () => {
      queryClient.setQueryData(ACTIVE_WORKOUT_KEY, null);
    },
  });

  return {
    activeWorkout,
    isLoading,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    stopWorkout,
    updateActive,
    discardWorkout,
  };
}
