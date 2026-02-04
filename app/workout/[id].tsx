import { ExerciseForm } from "@/components/ExerciseForm";
import { ExerciseListItem } from "@/components/ExerciseListItem";
import { GymMachine } from "@/consts/machines";
import { MuscleGroup } from "@/consts/muscles";
import { useUpdateWorkout, useWorkout } from "@/lib/hooks/useWorkouts";
import { Exercise, SetEntry } from "@/lib/storage/types";
import {
  formatDate,
  formatDateTime,
  formatDuration,
} from "@/lib/utils/dateUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: workout, isLoading } = useWorkout(id);
  const { updateWorkout } = useUpdateWorkout();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState(workout);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null);

  // Update editedWorkout when workout data loads
  if (workout && !editedWorkout) {
    setEditedWorkout(workout);
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-950 justify-center items-center">
        <ActivityIndicator size="large" className="text-primary-600" />
        <Text className="text-gray-600 dark:text-gray-400 mt-4">
          Loading workout...
        </Text>
      </SafeAreaView>
    );
  }

  if (!workout || !editedWorkout) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-950 p-4">
        <Text className="text-center text-gray-600 dark:text-gray-400 mt-8">
          Workout not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary-500 dark:bg-primary-600 py-3 px-6 rounded-lg"
        >
          <Text className="text-white text-center font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // T047: Handle save in edit mode
  const handleSave = async () => {
    try {
      await updateWorkout(id, editedWorkout);
      setIsEditMode(false);
      Alert.alert("Success", "Workout updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update workout");
      console.error("Failed to update workout:", error);
    }
  };

  // T045: Toggle edit mode
  const handleToggleEdit = () => {
    if (isEditMode) {
      // Confirm cancel
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              setEditedWorkout(workout);
              setIsEditMode(false);
            },
          },
        ],
      );
    } else {
      setIsEditMode(true);
    }
  };

  // T048: Add new exercise in edit mode
  const handleAddExercise = (exerciseData: {
    muscleGroups: MuscleGroup[];
    machine: GymMachine;
    sets: SetEntry[];
    notes: string | null;
  }) => {
    const newExercise: Exercise = {
      id: `exercise-${Date.now()}-${Math.random()}`,
      muscleGroups: exerciseData.muscleGroups,
      machine: exerciseData.machine,
      sets: exerciseData.sets,
      order: editedWorkout.exercises.length,
      createdAt: Date.now(),
      notes: exerciseData.notes,
    };

    setEditedWorkout({
      ...editedWorkout,
      exercises: [...editedWorkout.exercises, newExercise],
      updatedAt: Date.now(),
    });
  };

  // T049: Remove exercise in edit mode
  const handleRemoveExercise = (exerciseId: string) => {
    Alert.alert(
      "Remove Exercise",
      "Are you sure you want to remove this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const filteredExercises = editedWorkout.exercises.filter(
              (ex) => ex.id !== exerciseId,
            );
            // Reorder remaining exercises
            const reorderedExercises = filteredExercises.map((ex, index) => ({
              ...ex,
              order: index,
            }));
            setEditedWorkout({
              ...editedWorkout,
              exercises: reorderedExercises,
              updatedAt: Date.now(),
            });
          },
        },
      ],
    );
  };

  // T046: Edit existing exercise
  const handleEditExercise = (index: number) => {
    setEditingExerciseIndex(index);
    setShowExerciseForm(true);
  };

  const handleUpdateExercise = (exerciseData: {
    muscleGroups: MuscleGroup[];
    machine: GymMachine;
    sets: SetEntry[];
    notes: string | null;
  }) => {
    if (editingExerciseIndex === null) return;

    const updatedExercises = [...editedWorkout.exercises];
    updatedExercises[editingExerciseIndex] = {
      ...updatedExercises[editingExerciseIndex],
      muscleGroups: exerciseData.muscleGroups,
      machine: exerciseData.machine,
      sets: exerciseData.sets,
      notes: exerciseData.notes,
    };

    setEditedWorkout({
      ...editedWorkout,
      exercises: updatedExercises,
      updatedAt: Date.now(),
    });

    setEditingExerciseIndex(null);
  };

  const totalSets = editedWorkout.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0,
  );
  const totalReps = editedWorkout.exercises.reduce(
    (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0),
    0,
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-950">
      <ScrollView className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary-600 dark:text-primary-400 text-lg font-semibold">
              ← Back
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleToggleEdit}>
            <Text className="text-primary-600 dark:text-primary-400 text-lg font-semibold">
              {isEditMode ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Workout Info Card */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            {formatDate(editedWorkout.startTime)}
          </Text>

          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Started:</Text>
              <Text className="text-gray-900 dark:text-white font-semibold">
                {formatDateTime(editedWorkout.startTime)}
              </Text>
            </View>

            {editedWorkout.endTime && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-gray-400">Ended:</Text>
                <Text className="text-gray-900 dark:text-white font-semibold">
                  {formatDateTime(editedWorkout.endTime)}
                </Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">
                Duration:
              </Text>
              <Text className="text-gray-900 dark:text-white font-semibold">
                {formatDuration(editedWorkout.accumulatedTime)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-gray-600 dark:text-gray-400">Status:</Text>
              <View
                className={`px-2 py-1 rounded ${
                  editedWorkout.status === "completed"
                    ? "bg-green-100 dark:bg-green-900/30"
                    : "bg-yellow-100 dark:bg-yellow-900/30"
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    editedWorkout.status === "completed"
                      ? "text-green-700 dark:text-green-300"
                      : "text-yellow-700 dark:text-yellow-300"
                  }`}
                >
                  {editedWorkout.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Stats */}
        <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
          <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Summary
          </Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {editedWorkout.exercises.length}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">
                Exercise{editedWorkout.exercises.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalSets}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">Sets</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalReps}
              </Text>
              <Text className="text-gray-600 dark:text-gray-400">Reps</Text>
            </View>
          </View>
        </View>

        {/* Save Button (only in edit mode) */}
        {isEditMode && (
          <TouchableOpacity
            onPress={handleSave}
            className="bg-primary-500 dark:bg-primary-600 py-4 px-6 rounded-lg mb-4"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Save Changes
            </Text>
          </TouchableOpacity>
        )}

        {/* Add Exercise Button (only in edit mode) */}
        {isEditMode && (
          <TouchableOpacity
            onPress={() => {
              setEditingExerciseIndex(null);
              setShowExerciseForm(true);
            }}
            className="bg-primary-500 dark:bg-primary-600 py-4 px-6 rounded-lg mb-4"
          >
            <Text className="text-white text-center text-lg font-semibold">
              + Add Exercise
            </Text>
          </TouchableOpacity>
        )}

        {/* Exercises List */}
        <View className="mb-6">
          <Text className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Exercises ({editedWorkout.exercises.length})
          </Text>
          {editedWorkout.exercises.length === 0 ? (
            <Text className="text-center text-gray-600 dark:text-gray-400 py-8">
              No exercises in this workout
            </Text>
          ) : (
            editedWorkout.exercises.map((exercise, index) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => isEditMode && handleEditExercise(index)}
                disabled={!isEditMode}
              >
                <ExerciseListItem
                  exercise={exercise}
                  index={index}
                  onRemove={isEditMode ? handleRemoveExercise : undefined}
                  showRemoveButton={isEditMode}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Exercise Form Modal */}
      <ExerciseForm
        visible={showExerciseForm}
        onClose={() => {
          setShowExerciseForm(false);
          setEditingExerciseIndex(null);
        }}
        onSave={
          editingExerciseIndex !== null
            ? handleUpdateExercise
            : handleAddExercise
        }
        initialData={
          editingExerciseIndex !== null
            ? editedWorkout.exercises[editingExerciseIndex]
            : undefined
        }
      />
    </SafeAreaView>
  );
}
