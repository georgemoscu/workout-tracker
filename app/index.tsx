import { PlanCard } from "@/components/PlanCard";
import { RecoveryModal } from "@/components/RecoveryModal";
import { WorkoutCard } from "@/components/WorkoutCard";
import { useActiveWorkout } from "@/lib/hooks/useActiveWorkout";
import { requestNotificationPermissions } from "@/lib/hooks/useNotification";
import { fetchWorkoutBatch } from "@/lib/hooks/useWorkouts";
import { WorkoutPlan } from "@/lib/storage/types";
import { getPlansByDay } from "@/lib/storage/workoutStorage";
import { Lucide } from "@react-native-vector-icons/lucide";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DatePicker, { SingleOutput } from "react-native-neat-date-picker";
import { SafeAreaView } from "react-native-safe-area-context";

// T006: Empty state component for when no workouts exist
function EmptyWorkoutState() {
  return (
    <View className="flex-1 justify-center items-center py-16 px-6">
      <Lucide
        name="dumbbell"
        size={64}
        color="rgb(156, 163, 175)" // gray-400
        className="mb-6"
      />
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        No workouts yet
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center">
        Start your first workout!
      </Text>
    </View>
  );
}

export default function Index() {
  const [showDatePickerRange, setShowDatePickerRange] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const router = useRouter();
  const { activeWorkout, startWorkout, startFromPlan, discardWorkout } =
    useActiveWorkout();

  // T072: Check for active workout on mount (force-close recovery)
  useEffect(() => {
    if (activeWorkout && activeWorkout.status === "in-progress") {
      setShowRecoveryModal(true);
    }
  }, [activeWorkout]);

  // T060: Fetch today's plans
  const today = new Date().getDay();
  const { data: todaysPlans = [] } = useQuery({
    queryKey: ["plans", today],
    queryFn: () => getPlansByDay(today),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // T003: Fetch completed workouts with infinite scroll
  const {
    data: workoutsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["workouts", "completed"],
    queryFn: ({ pageParam = 0 }) => fetchWorkoutBatch(pageParam, 20),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true,
  });

  // Flatten pages into single array
  const workouts = workoutsData?.pages.flatMap((page) => page.workouts) ?? [];

  function onCancelDatePicker() {
    setShowDatePickerRange(false);
  }

  function onConfirmDatePicker(date: SingleOutput) {
    console.log("Selected date: ", date);
    setShowDatePickerRange(false);
  }

  // T060: Handle start workout from plan
  const handleStartWorkout = async () => {
    // T079: Workout blocking - prevent starting if one is in progress
    if (activeWorkout) {
      Alert.alert(
        "Active Workout",
        "You already have an active workout. Please complete or stop it before starting a new one.",
      );
      return;
    }

    // T075: Request notification permissions on first workout start
    await requestNotificationPermissions();

    await startWorkout.mutateAsync();
    router.push("/start-workout");
  };

  // T060: Handle start workout from plan
  const handleStartFromPlan = async (plan: WorkoutPlan) => {
    // T079: Workout blocking
    if (activeWorkout) {
      Alert.alert(
        "Active Workout",
        "You already have an active workout. Please complete or stop it before starting a new one.",
      );
      return;
    }

    // T075: Request notification permissions on first workout start
    await requestNotificationPermissions();

    try {
      await startFromPlan.mutateAsync(plan.plannedExercises);
      router.push("/start-workout");
    } catch (error) {
      Alert.alert("Error", "Failed to start workout from plan.");
      console.error("Failed to start from plan:", error);
    }
  };

  // T073: Recovery resume - navigate to active workout
  const handleRecoveryResume = () => {
    setShowRecoveryModal(false);
    router.push("/start-workout");
  };

  // T074: Recovery discard - delete active workout
  const handleRecoveryDiscard = async () => {
    try {
      await discardWorkout.mutateAsync();
      setShowRecoveryModal(false);
      Alert.alert(
        "Workout Discarded",
        "Your incomplete workout has been removed.",
      );
    } catch (error) {
      console.error("Failed to discard workout:", error);
      Alert.alert("Error", "Failed to discard workout. Please try again.");
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
              onPress={() => router.push("/settings" as any)}
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

        {/* T009: Error recovery banner */}
        {error && (
          <View className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg mb-4">
            <Text className="text-red-700 dark:text-red-300 font-semibold mb-2">
              Failed to load workouts
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="bg-red-600 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* T004-T008: Replace ScrollView with FlatList for infinite scroll */}
        <FlatList
          data={workouts}
          keyExtractor={(workout) => workout.id}
          renderItem={({ item: workout }) => (
            <WorkoutCard key={workout.id} workout={workout} />
          )}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 justify-center items-center py-12">
                <ActivityIndicator size="large" />
              </View>
            ) : (
              <EmptyWorkoutState />
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4">
                <ActivityIndicator />
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 128 }}
          // T012: Performance optimizations for large datasets
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={21}
          initialNumToRender={20}
        />

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

      {/* T072-T074: Force-close recovery modal */}
      {activeWorkout && (
        <RecoveryModal
          visible={showRecoveryModal}
          workout={activeWorkout}
          onResume={handleRecoveryResume}
          onDiscard={handleRecoveryDiscard}
        />
      )}
    </>
  );
}
