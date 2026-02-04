import Lucide from "@react-native-vector-icons/lucide";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function StartWorkout() {
  const router = useRouter();

  function handlePlanWorkout() {
    router.dismiss();
    router.push("/plan-workout");
  }

  function handleQuickStart() {
    router.dismiss();
    router.push("/quick-start");
  }

  return (
    <View className="p-4 justify-between">
      <Text className="text-3xl font-bold mt-2 mb-4">Start a workout!</Text>

      <View className="flex-row gap-x-2">
        <TouchableOpacity
          onPress={() => handlePlanWorkout()}
          className="flex-1 px-4 py-10 bg-yellow-600 rounded-lg mb-4"
        >
          <View className="justify-center items-center gap-y-2">
            <Lucide name="clipboard-list" size={32} color="white" />
            <Text className="text-white text-xl text-center">Plan Workout</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleQuickStart()}
          className="flex-1 px-4 py-10 bg-green-600 rounded-lg mb-4"
        >
          <View className="justify-center items-center gap-y-2">
            <Lucide name="dumbbell" size={32} color="white" />
            <Text className="text-white text-xl text-center">Quick start</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
