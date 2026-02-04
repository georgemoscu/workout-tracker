import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseListItem } from "@/components/ExerciseListItem";
import { WorkoutTimer } from "@/components/WorkoutTimer";
import { GymMachine } from "@/consts/machines";
import { MuscleGroup } from "@/consts/muscles";
import { useActiveWorkout } from "@/lib/hooks/useActiveWorkout";
import { useNotification } from "@/lib/hooks/useNotification";
import { Exercise, SetEntry, Workout } from "@/lib/storage/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StartWorkout() {
  const router = useRouter();
  const { activeWorkout, pauseWorkout, resumeWorkout, stopWorkout } =
    useActiveWorkout();
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  // T075-T077: Use notification hook for 3-hour workout alert
  useNotification(activeWorkout);

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

    // T088: Calculate workout summary
    const totalSets = activeWorkout.exercises.reduce(
      (sum, ex) => sum + ex.sets.length,
      0,
    );
    const totalReps = activeWorkout.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0),
      0,
    );
    const duration = Math.floor(activeWorkout.accumulatedTime / 60); // minutes

    Alert.alert(
      "Stop Workout",
      `Are you sure you want to stop this workout?\n\nDuration: ${duration} minutes\nExercises: ${activeWorkout.exercises.length}\nTotal Sets: ${totalSets}\nTotal Reps: ${totalReps}`,
      [
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
      ],
    );
  };

  // T035: Exercise creation logic
  const handleAddExercise = (exerciseData: {
    muscleGroups: MuscleGroup[];
    machine: GymMachine;
    sets: SetEntry[];
    notes: string | null;
  }) => {
    if (!activeWorkout) return;

    // T035: Create new exercise with unique ID and order
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      muscleGroups: exerciseData.muscleGroups,
      machine: exerciseData.machine,
      sets: exerciseData.sets,
      order: activeWorkout.exercises.length,
      createdAt: Date.now(),
      notes: exerciseData.notes,
    };

    // T037: Save exercise to workout
    const updatedWorkout: Workout = {
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise],
      updatedAt: Date.now(),
    };

    // Update via mutation (this will save to AsyncStorage)
    pauseWorkout.mutateAsync(updatedWorkout);
  };

  // T039A: Remove exercise functionality
  const handleRemoveExercise = (exerciseId: string) => {
    if (!activeWorkout) return;

    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            // Remove exercise and reorder remaining exercises
            const filteredExercises = activeWorkout.exercises.filter(
              (ex) => ex.id !== exerciseId,
            );
            const reorderedExercises = filteredExercises.map((ex, index) => ({
              ...ex,
              order: index,
            }));

            const updatedWorkout: Workout = {
              ...activeWorkout,
              exercises: reorderedExercises,
              updatedAt: Date.now(),
            };

            // Update via mutation
            pauseWorkout.mutateAsync(updatedWorkout);
          },
        },
      ],
    );
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

        {/* T034: Add Exercise Button */}
        <TouchableOpacity
          className="bg-primary-500 dark:bg-primary-600 py-4 px-6 rounded-lg mt-6 active:opacity-80"
          onPress={() => setShowExerciseForm(true)}
        >
          <Text className="text-white text-center text-lg font-semibold">
            + Add Exercise
          </Text>
        </TouchableOpacity>

        {/* T038: Exercise List Display */}
        <View className="mt-6">
          <Text className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Exercises ({activeWorkout.exercises.length})
          </Text>
          {activeWorkout.exercises.length === 0 && (
            <Text className="text-center text-gray-600 dark:text-gray-400 py-8">
              No exercises added yet. Tap "+ Add Exercise" to begin.
            </Text>
          )}
          {activeWorkout.exercises.map((exercise, index) => (
            <ExerciseListItem
              key={exercise.id}
              exercise={exercise}
              index={index}
              onRemove={handleRemoveExercise}
              showRemoveButton={true}
            />
          ))}
        </View>
      </ScrollView>

      {/* Exercise Form Modal */}
      <ExerciseForm
        visible={showExerciseForm}
        onClose={() => setShowExerciseForm(false)}
        onSave={handleAddExercise}
      />
    </SafeAreaView>
  );
}
