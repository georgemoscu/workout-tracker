import { Exercise } from "@/lib/storage/types";
import { Text, TouchableOpacity, View } from "react-native";

interface ExerciseListItemProps {
  exercise: Exercise;
  index: number;
  onRemove?: (exerciseId: string) => void;
  showRemoveButton?: boolean;
}

export function ExerciseListItem({
  exercise,
  index,
  onRemove,
  showRemoveButton = true,
}: ExerciseListItemProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700">
      {/* Header: Exercise Number and Remove Button */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Exercise {index + 1}
        </Text>
        {showRemoveButton && onRemove && (
          <TouchableOpacity
            onPress={() => onRemove(exercise.id)}
            className="bg-red-500 dark:bg-red-600 px-3 py-1 rounded-lg"
          >
            <Text className="text-white font-semibold text-sm">Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Muscle Groups */}
      <View className="mb-2">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
          Muscle Groups
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {exercise.muscleGroups.map((muscle) => (
            <View
              key={muscle}
              className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full"
            >
              <Text className="text-primary-700 dark:text-primary-300 font-medium text-sm">
                {muscle}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Equipment */}
      <View className="mb-2">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
          Equipment
        </Text>
        <Text className="text-gray-900 dark:text-white">
          {exercise.machine}
        </Text>
      </View>

      {/* Sets & Reps */}
      <View className="mb-2">
        <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
          Sets & Reps
        </Text>
        <View className="gap-1">
          {exercise.sets.map((set, setIndex) => (
            <View key={set.id} className="flex-row items-center py-1">
              <Text className="text-gray-700 dark:text-gray-300 w-16">
                Set {setIndex + 1}:
              </Text>
              <Text className="text-gray-900 dark:text-white font-semibold">
                {set.reps} reps
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Notes (if any) */}
      {exercise.notes && (
        <View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            Notes
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 italic">
            {exercise.notes}
          </Text>
        </View>
      )}

      {/* Summary */}
      <View className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Total: {exercise.sets.length} set
          {exercise.sets.length !== 1 ? "s" : ""},{" "}
          {exercise.sets.reduce((sum, set) => sum + set.reps, 0)} reps
        </Text>
      </View>
    </View>
  );
}
