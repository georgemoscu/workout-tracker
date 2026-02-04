import WorkoutCard from "@/components/WorkoutCard";
import { Lucide } from "@react-native-vector-icons/lucide";
import { Link } from "expo-router";
import { useState } from "react";
import {
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

  function onCancelDatePicker() {
    setShowDatePickerRange(false);
  }

  function onConfirmDatePicker(date: SingleOutput) {
    console.log("Selected date: ", date);
    setShowDatePickerRange(false);
  }

  return (
    <>
      <SafeAreaView className="flex-1 mt-6 px-4 pt-4 -mb-4 bg-gray-100">
        <StatusBar barStyle="dark-content" />
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-3xl font-bold">Your workouts!</Text>

          <TouchableOpacity
            onPress={() => setShowDatePickerRange(true)}
            className="flex-row items-center gap-x-2 p-2 border border-gray-300 rounded-lg"
          >
            <Text className="text-xl">12 March</Text>
            <Lucide name="calendar" size={24} color="black" />
          </TouchableOpacity>
        </View>

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
