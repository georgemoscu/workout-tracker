// Recovery modal for handling force-close/incomplete workouts
import { Workout } from "@/lib/storage/types";
import { formatDuration } from "@/lib/utils/dateUtils";
import { Modal, Pressable, Text, View } from "react-native";

interface RecoveryModalProps {
  visible: boolean;
  workout: Workout;
  onResume: () => void;
  onDiscard: () => void;
}

export function RecoveryModal({
  visible,
  workout,
  onResume,
  onDiscard,
}: RecoveryModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onResume}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Resume Workout?
          </Text>

          <Text className="text-gray-600 dark:text-gray-400 mb-2">
            You have an incomplete workout from your last session.
          </Text>

          <View className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600 dark:text-gray-400">
                Duration:
              </Text>
              <Text className="text-gray-900 dark:text-white font-semibold">
                {formatDuration(workout.accumulatedTime)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">
                Exercises:
              </Text>
              <Text className="text-gray-900 dark:text-white font-semibold">
                {workout.exercises.length}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Pressable
              onPress={onResume}
              className="bg-primary-500 dark:bg-primary-600 py-4 px-6 rounded-lg active:opacity-80"
            >
              <Text className="text-white text-center text-lg font-bold">
                Resume Workout
              </Text>
            </Pressable>

            <Pressable
              onPress={onDiscard}
              className="bg-gray-300 dark:bg-gray-600 py-4 px-6 rounded-lg active:opacity-80"
            >
              <Text className="text-gray-700 dark:text-gray-200 text-center text-lg font-semibold">
                Discard
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
