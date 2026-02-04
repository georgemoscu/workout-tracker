import { WorkoutPlan } from "@/lib/storage/types";
import { Text, TouchableOpacity, View } from "react-native";

interface PlanCardProps {
  plan: WorkoutPlan;
  onStartFromPlan: (plan: WorkoutPlan) => void;
}

export function PlanCard({ plan, onStartFromPlan }: PlanCardProps) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border-2 border-primary-300 dark:border-primary-700">
      {/* Header */}
      <View className="flex-row items-center mb-2">
        <View className="bg-primary-100 dark:bg-primary-900/30 px-2 py-1 rounded mr-2">
          <Text className="text-primary-700 dark:text-primary-300 text-xs font-bold">
            PLAN
          </Text>
        </View>
        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
          {plan.name}
        </Text>
      </View>

      {/* Exercise Count */}
      <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3">
        {plan.plannedExercises.length} planned exercise
        {plan.plannedExercises.length !== 1 ? "s" : ""}
      </Text>

      {/* Exercise Preview */}
      <View className="gap-1 mb-3">
        {plan.plannedExercises.slice(0, 2).map((exercise, index) => (
          <Text
            key={exercise.id}
            className="text-gray-700 dark:text-gray-300 text-sm"
          >
            • {exercise.muscleGroups.join(", ")} - {exercise.targetSets}×
            {exercise.targetReps}
          </Text>
        ))}
        {plan.plannedExercises.length > 2 && (
          <Text className="text-gray-500 dark:text-gray-500 text-sm italic">
            +{plan.plannedExercises.length - 2} more
          </Text>
        )}
      </View>

      {/* Quick Start Button */}
      <TouchableOpacity
        onPress={() => onStartFromPlan(plan)}
        className="bg-primary-500 dark:bg-primary-600 py-2 px-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">
          Quick Start from Plan
        </Text>
      </TouchableOpacity>
    </View>
  );
}
