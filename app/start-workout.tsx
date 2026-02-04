import { WorkoutTimer } from "@/components/WorkoutTimer";
import { useActiveWorkout } from "@/lib/hooks/useActiveWorkout";
import { useRouter } from "expo-router";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartWorkout() {
  const router = useRouter();
  const { activeWorkout, pauseWorkout, resumeWorkout, stopWorkout } =
    useActiveWorkout();

  const handlePause = async () => {
    if (!activeWorkout) return;
    await pauseWorkout.mutateAsync(activeWorkout);
  };

  const handleResume = async () => {
    if (!activeWorkout) return;
    await resumeWorkout.mutateAsync(activeWorkout);
  };

  const handleStop = async () => {
    if (!activeWorkout) return;

    Alert.alert("Stop Workout", "Are you sure you want to stop this workout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Stop",
        style: "destructive",
        onPress: async () => {
          await stopWorkout.mutateAsync(activeWorkout);
          router.back();
        },
      },
    ]);
  };

  if (!activeWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-950 p-4">
        <Text className="text-center text-gray-600 dark:text-gray-400 mt-8">
          No active workout
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-950">
      <ScrollView className="p-4">
        <Text className="text-3xl font-bold mt-2 mb-6 text-gray-900 dark:text-white">
          Active Workout
        </Text>

        {/* Timer Component */}
        <WorkoutTimer
          workout={activeWorkout}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
        />

        {/* Add Exercise Button - Placeholder for T034 */}
        <TouchableOpacity
          className="bg-primary-500 dark:bg-primary-600 py-4 px-6 rounded-lg mt-6 active:opacity-80"
          disabled
        >
          <Text className="text-white text-center text-lg font-semibold">
            Add Exercise (Coming Soon)
          </Text>
        </TouchableOpacity>

        {/* Exercise List - Placeholder for T038 */}
        <View className="mt-6">
          <Text className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Exercises ({activeWorkout.exercises.length})
          </Text>
          {activeWorkout.exercises.length === 0 && (
            <Text className="text-center text-gray-600 dark:text-gray-400 py-8">
              No exercises added yet
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
