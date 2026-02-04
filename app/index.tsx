import { PlanCard } from "@/components/PlanCard";
import { WorkoutCard } from "@/components/WorkoutCard";
import { useActiveWorkout } from "@/lib/hooks/useActiveWorkout";
import { WorkoutPlan } from "@/lib/storage/types";
import { getPlansByDay } from "@/lib/storage/workoutStorage";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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
  const { activeWorkout, startWorkout, startFromPlan } = useActiveWorkout();

  // T060: Fetch today's plans
  const today = new Date().getDay();
  const { data: todaysPlans = [] } = useQuery({
    queryKey: ["plans", today],
    queryFn: () => getPlansByDay(today),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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

  // T060: Handle start workout from plan
  const handleStartFromPlan = async (plan: WorkoutPlan) => {
    if (activeWorkout) {
      Alert.alert(
        "Active Workout",
        "You already have an active workout. Please complete or stop it before starting a new one.",
      );
      return;
    }

    try {
      await startFromPlan.mutateAsync(plan.plannedExercises);
      router.push("/start-workout");
    } catch (error) {
      Alert.alert("Error", "Failed to start workout from plan.");
      console.error("Failed to start from plan:", error);
    }
  };

  return (
    <>
      <SafeAreaView className="flex-1 mt-6 px-4 pt-4 -mb-4 bg-gray-100 dark:bg-gray-950">
        <StatusBar barStyle="dark-content" />
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            Your workouts!
          </Text>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push("/settings/index")}
              className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg"
            >
              <Lucide name="settings" size={24} color="currentColor" />
            </TouchableOpacity>
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

        {/* T060: Today's Plans */}
        {todaysPlans.length > 0 && !activeWorkout && (
          <View className="mb-4">
            <Text className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
              Today's Plans
            </Text>
            {todaysPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onStartFromPlan={handleStartFromPlan}
              />
            ))}
          </View>
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
