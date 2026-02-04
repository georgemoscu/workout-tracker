// Workout Timer component with start/pause/resume/stop controls
import type { Workout } from "@/lib/storage/types";
import { calculateDuration, formatTimer } from "@/lib/utils/timerUtils";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface WorkoutTimerProps {
  workout: Workout;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function WorkoutTimer({
  workout,
  onPause,
  onResume,
  onStop,
}: WorkoutTimerProps) {
  const [currentDuration, setCurrentDuration] = useState(0);
  const isPaused = workout.pausedAt !== null;

  useEffect(() => {
    if (isPaused) {
      // If paused, show frozen duration
      setCurrentDuration(workout.accumulatedTime);
      return;
    }

    // Update timer every second when running
    const interval = setInterval(() => {
      setCurrentDuration(calculateDuration(workout));
    }, 1000);

    return () => clearInterval(interval);
  }, [workout, isPaused]);

  return (
    <View className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
      {/* Timer Display */}
      <Text className="text-6xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        {formatTimer(currentDuration)}
      </Text>

      {/* Controls */}
      <View className="flex-row gap-3 justify-center">
        {/* Pause/Resume Button */}
        {isPaused ? (
          <Pressable
            onPress={onResume}
            className="flex-1 bg-primary-500 dark:bg-primary-600 py-4 px-6 rounded-lg active:opacity-80"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Resume
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={onPause}
            className="flex-1 bg-gray-500 dark:bg-gray-600 py-4 px-6 rounded-lg active:opacity-80"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Pause
            </Text>
          </Pressable>
        )}

        {/* Stop Button */}
        <Pressable
          onPress={onStop}
          className="flex-1 bg-primary-700 dark:bg-primary-800 py-4 px-6 rounded-lg active:opacity-80"
        >
          <Text className="text-white text-center text-lg font-semibold">
            Stop
          </Text>
        </Pressable>
      </View>

      {/* Status Indicator */}
      <View className="flex-row items-center justify-center mt-4">
        <View
          className={`w-2 h-2 rounded-full mr-2 ${
            isPaused ? "bg-gray-500" : "bg-green-500"
          }`}
        />
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          {isPaused ? "Paused" : "Recording"}
        </Text>
      </View>
    </View>
  );
}
