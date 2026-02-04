import WorkoutCard from "@/components/WorkoutCard";
import { useActiveWorkout } from "@/lib/hooks/useActiveWorkout";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker, { SingleOutput } from "react-native-neat-date-picker";
import { SafeAreaView } from "react-native-safe-area-context";

const workouts = Array.from({ length: 30 }).map((_, i) => `Workout ${i + 1}`);

export default function Index() {
  const [showDatePickerRange, setShowDatePickerRange] = useState(false);
  const router = useRouter();
  const { activeWorkout, startWorkout } = useActiveWorkout();

  function onCancelDatePicker() {
    setShowDatePickerRange(false);
  }

  function onConfirmDatePicker(date: SingleOutput) {
    console.log("Selected date: ", date);
    setShowDatePickerRange(false);
  }

  const handleStartWorkout = async () => {
    await startWorkout.mutateAsync();
    router.push("/start-workout");
  };

  return (
    <>
      <SafeAreaView className="flex-1 mt-6 px-4 pt-4 -mb-4 bg-gray-100 dark:bg-gray-950">
        <StatusBar barStyle="dark-content" />
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Your workouts!
          </Text>

          <TouchableOpacity
            onPress={() => setShowDatePickerRange(true)}
            className="flex-row items-center gap-x-2 p-2 border border-gray-300 dark:border-gray-700 rounded-lg"
          >
            <Text className="text-xl text-gray-900 dark:text-white">
              12 March
            </Text>
            <Lucide name="calendar" size={24} color="currentColor" />
          </TouchableOpacity>
        </View>

        {/* Start Workout Button - 2-tap requirement (tap 1) */}
        {!activeWorkout && (
          <Pressable
            onPress={handleStartWorkout}
            className="bg-primary-500 dark:bg-primary-600 py-4 px-6 rounded-lg mb-4 active:opacity-80"
          >
            <Text className="text-white text-center text-xl font-bold">
              Start Workout
            </Text>
          </Pressable>
        )}

        {/* Active Workout Indicator */}
        {activeWorkout && (
          <Pressable
            onPress={() => router.push("/start-workout")}
            className="bg-green-500 dark:bg-green-600 py-4 px-6 rounded-lg mb-4 active:opacity-80"
          >
            <Text className="text-white text-center text-xl font-bold">
              Resume Active Workout
            </Text>
          </Pressable>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mb-32">
            {workouts.map((workout) => (
              <WorkoutCard key={workout} workout={workout} />
            ))}
          </View>
        </ScrollView>

        <Link href={{ pathname: "/start-workout" }} asChild>
          <TouchableOpacity
            className="absolute bottom-12 right-8 bg-blue-600 rounded-full p-6 shadow-lg"
            onPress={() => {}}
          >
            <Lucide name="plus" size={24} color="white" />
          </TouchableOpacity>
        </Link>
      </SafeAreaView>

      <DatePicker
        isVisible={showDatePickerRange}
        mode="single"
        onCancel={onCancelDatePicker}
        onConfirm={onConfirmDatePicker}
      />
    </>
  );
}
