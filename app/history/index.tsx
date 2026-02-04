import { WorkoutCard } from "@/components/WorkoutCard";
import { useWorkouts } from "@/lib/hooks/useWorkouts";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function History() {
  const { workouts, isLoading, refetch } = useWorkouts({
    limit: 20,
    offset: 0,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" className="text-primary-600" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">
          Loading workouts...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-950">
      <View className="p-4">
        <Text className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Workout History
        </Text>

        {workouts.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 dark:text-gray-400 text-lg text-center">
              No workouts yet
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-center mt-2">
              Start your first workout to see it here!
            </Text>
          </View>
        ) : (
          <FlatList
            data={workouts}
            renderItem={({ item }) => <WorkoutCard workout={item} />}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor="#DC143C"
              />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListFooterComponent={
              workouts.length > 0 ? (
                <Text className="text-center text-gray-400 dark:text-gray-500 mt-4">
                  {workouts.length} workout{workouts.length !== 1 ? "s" : ""}
                </Text>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
