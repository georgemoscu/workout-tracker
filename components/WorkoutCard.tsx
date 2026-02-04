import { Workout } from "@/lib/storage/types";
import { formatDate, formatDuration } from "@/lib/utils/dateUtils";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

interface WorkoutCardProps {
  workout: Workout;
}

export function WorkoutCard({ workout }: WorkoutCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/workout/${workout.id}` as any);
  };

  // Calculate total sets across all exercises
  const totalSets = workout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  );

  // Calculate total reps across all exercises
  const totalReps = workout.exercises.reduce(
    (sum, exercise) =>
      sum + exercise.sets.reduce((setSum, set) => setSum + set.reps, 0),
    0,
  );

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700 active:opacity-70"
    >
      {/* Header: Date and Duration */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {formatDate(workout.startTime)}
        </Text>
        <View className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full">
          <Text className="text-primary-700 dark:text-primary-300 font-semibold">
            {formatDuration(workout.accumulatedTime)}
          </Text>
        </View>
      </View>

      {/* Summary Stats */}
      <View className="flex-row justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-gray-600 dark:text-gray-400">
            {workout.exercises.length} exercise
            {workout.exercises.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-gray-600 dark:text-gray-400">
            {totalSets} sets • {totalReps} reps
          </Text>
        </View>
      </View>

      {/* Exercise Preview (first 2 exercises) */}
      {workout.exercises.length > 0 && (
        <View className="gap-1">
          {workout.exercises.slice(0, 2).map((exercise, index) => (
            <View key={exercise.id} className="flex-row items-center">
              <Text className="text-gray-700 dark:text-gray-300 flex-1">
                • {exercise.muscleGroups.join(", ")} - {exercise.machine}
              </Text>
              <Text className="text-gray-500 dark:text-gray-500 text-sm">
                {exercise.sets.length} sets
              </Text>
            </View>
          ))}
          {workout.exercises.length > 2 && (
            <Text className="text-gray-500 dark:text-gray-500 text-sm italic">
              +{workout.exercises.length - 2} more
            </Text>
          )}
        </View>
      )}

      {/* Status Badge */}
      <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <View
          className={`self-start px-2 py-1 rounded ${
            workout.status === "completed"
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-yellow-100 dark:bg-yellow-900/30"
          }`}
        >
          <Text
            className={`text-xs font-semibold ${
              workout.status === "completed"
                ? "text-green-700 dark:text-green-300"
                : "text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {workout.status === "completed" ? "Completed" : "Incomplete"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
