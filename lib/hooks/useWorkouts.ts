import { Workout } from "@/lib/storage/types";
import {
  getWorkoutById,
  getWorkoutIds,
  updateWorkout,
} from "@/lib/storage/workoutStorage";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * T001: Fetch workout batch for infinite scroll pagination
 * Returns paginated workout data with metadata for next page
 */
export async function fetchWorkoutBatch(
  offset: number,
  limit: number,
): Promise<{
  workouts: Workout[];
  nextOffset: number;
  hasMore: boolean;
}> {
  try {
    // Fetch IDs for this page
    const ids = await getWorkoutIds(offset, limit);

    // Fetch workouts in parallel
    const workouts = await Promise.all(
      ids.map((id) =>
        getWorkoutById(id).catch((err) => {
          console.error(`Failed to load workout ${id}:`, err);
          return null;
        }),
      ),
    );

    // Filter out nulls and non-completed workouts
    const validWorkouts = workouts
      .filter((w): w is Workout => w !== null)
      .filter((w) => w.status === "completed");

    return {
      workouts: validWorkouts,
      nextOffset: offset + limit,
      hasMore: ids.length === limit,
    };
  } catch (error) {
    console.error("Error fetching workout batch:", error);
    return {
      workouts: [],
      nextOffset: offset,
      hasMore: false,
    };
  }
}

/**
 * Hook for managing workout history with pagination
 * T040: TanStack Query hook for workout list
 */

interface UseWorkoutsOptions {
  limit?: number;
  offset?: number;
}

export function useWorkouts(options: UseWorkoutsOptions = {}) {
  const { limit = 20, offset = 0 } = options;
  const queryClient = useQueryClient();

  // Fetch workout IDs with pagination
  const workoutIdsQuery = useQuery({
    queryKey: ["workoutIds", { offset, limit }],
    queryFn: () => getWorkoutIds(offset, limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch individual workouts based on IDs
  const workoutsQuery = useQuery({
    queryKey: ["workouts", { ids: workoutIdsQuery.data }],
    queryFn: async () => {
      if (!workoutIdsQuery.data || workoutIdsQuery.data.length === 0) {
        return [];
      }

      const workouts = await Promise.all(
        workoutIdsQuery.data.map((id) => getWorkoutById(id)),
      );

      // Filter out nulls
      return workouts.filter((w): w is Workout => w !== null);
    },
    enabled: !!workoutIdsQuery.data && workoutIdsQuery.data.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    workouts: workoutsQuery.data || [],
    isLoading: workoutIdsQuery.isLoading || workoutsQuery.isLoading,
    isError: workoutIdsQuery.isError || workoutsQuery.isError,
    error: workoutIdsQuery.error || workoutsQuery.error,
    refetch: () => {
      workoutIdsQuery.refetch();
      workoutsQuery.refetch();
    },
  };
}

/**
 * Hook for fetching a single workout by ID
 */
export function useWorkout(id: string | null) {
  return useQuery({
    queryKey: ["workout", id],
    queryFn: () => {
      if (!id) return null;
      return getWorkoutById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook for updating a workout with optimistic updates (T051)
 */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return {
    updateWorkout: async (id: string, workout: Workout) => {
      // Optimistic update
      queryClient.setQueryData(["workout", id], workout);

      try {
        await updateWorkout(id, workout);

        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ["workout", id] });
        queryClient.invalidateQueries({ queryKey: ["workouts"] });
      } catch (error) {
        // Rollback on error
        queryClient.invalidateQueries({ queryKey: ["workout", id] });
        throw error;
      }
    },
  };
}
