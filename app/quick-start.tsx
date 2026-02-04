import ExerciseForm from "@/components/ExerciseForm";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval: number | null = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (isPaused || !isActive) {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  return {
    seconds,
    isActive,
    isPaused,
    stop: () => {
      setIsActive(false);
      setSeconds(0);
    },
    start: () => {
      setIsActive(true);
      setIsPaused(false);
    },
    pause: () => {
      setIsPaused(true);
    },
  };
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
}

export default function QuickStart() {
  const timer = useTimer();

  return (
    <SafeAreaView className="flex-1 p-4 pt-12">
      <ScrollView showsHorizontalScrollIndicator={false}>
        <View className="header">
          <Text className="font-bold text-4xl">Workout Started!</Text>
          <Text className="font-medium text-6xl mt-2">
            {formatTime(timer.seconds)}
          </Text>
        </View>

        <View>
          <Text className="text-2xl font-bold mt-8 mb-4">Exercises</Text>
          <ExerciseForm />
        </View>

        <TouchableOpacity
          onPress={() =>
            timer.isActive
              ? timer.pause()
              : timer.isPaused
              ? timer.start()
              : timer.start()
          }
          className={
            "mt-8 rounded-lg px-4 py-3" +
            (timer.isActive
              ? " bg-red-600"
              : timer.isPaused
              ? " bg-green-600"
              : " bg-blue-600")
          }
        >
          <Text className="text-white text-xl text-center">
            {timer.isActive
              ? "Pause Workout"
              : timer.isPaused
              ? "Resume Workout"
              : "Start Workout"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
