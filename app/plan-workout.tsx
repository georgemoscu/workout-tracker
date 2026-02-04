import { PlannedExerciseForm } from "@/components/PlannedExerciseForm";
import { WeekCalendar } from "@/components/WeekCalendar";
import { GymMachine } from "@/consts/machines";
import { MuscleGroup } from "@/consts/muscles";
import { useActiveWorkout } from "@/lib/hooks/useActiveWorkout";
import { PlannedExercise, WorkoutPlan } from "@/lib/storage/types";
import {
  deleteWorkoutPlan,
  getPlansByDay,
  saveWorkoutPlan,
} from "@/lib/storage/workoutStorage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlanWorkout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeWorkout, startFromPlan } = useActiveWorkout();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // Current day of week
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [planName, setPlanName] = useState("");
  const [plannedExercises, setPlannedExercises] = useState<PlannedExercise[]>(
    [],
  );
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);

  // T055: Fetch plans for selected day
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["plans", selectedDay],
    queryFn: () => getPlansByDay(selectedDay),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // T056: Handle adding planned exercise
  const handleAddExercise = (exerciseData: {
    muscleGroups: MuscleGroup[];
    machine: GymMachine;
    targetSets: number;
    targetReps: number;
    notes: string | null;
  }) => {
    const newExercise: PlannedExercise = {
      id: `planned-exercise-${Date.now()}-${Math.random()}`,
      muscleGroups: exerciseData.muscleGroups,
      machine: exerciseData.machine,
      targetSets: exerciseData.targetSets,
      targetReps: exerciseData.targetReps,
      order: plannedExercises.length,
      notes: exerciseData.notes,
    };

    setPlannedExercises([...plannedExercises, newExercise]);
  };

  // Remove planned exercise from list
  const handleRemoveExercise = (exerciseId: string) => {
    const filtered = plannedExercises.filter((ex) => ex.id !== exerciseId);
    // Reorder
    const reordered = filtered.map((ex, index) => ({ ...ex, order: index }));
    setPlannedExercises(reordered);
  };

  // T057: Save workout plan
  const handleSavePlan = async () => {
    if (!planName.trim()) {
      Alert.alert("Validation Error", "Please enter a plan name.");
      return;
    }

    if (plannedExercises.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please add at least one exercise to the plan.",
      );
      return;
    }

    try {
      const planId = editingPlan?.id || `plan-${Date.now()}-${Math.random()}`;
      const plan: WorkoutPlan = {
        id: planId,
        dayOfWeek: selectedDay,
        name: planName.trim(),
        plannedExercises,
        createdAt: editingPlan?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      await saveWorkoutPlan(plan);
      queryClient.invalidateQueries({ queryKey: ["plans", selectedDay] });

      // Reset form
      setPlanName("");
      setPlannedExercises([]);
      setIsCreatingPlan(false);
      setEditingPlan(null);

      Alert.alert("Success", "Workout plan saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save workout plan.");
      console.error("Failed to save plan:", error);
    }
  };

  // Start creating new plan
  const handleStartCreating = () => {
    setPlanName("");
    setPlannedExercises([]);
    setEditingPlan(null);
    setIsCreatingPlan(true);
  };

  // T062: Edit existing plan
  const handleEditPlan = (plan: WorkoutPlan) => {
    setPlanName(plan.name);
    setPlannedExercises(plan.plannedExercises);
    setEditingPlan(plan);
    setIsCreatingPlan(true);
  };

  // T061: Delete plan
  const handleDeletePlan = async (planId: string) => {
    Alert.alert(
      "Delete Plan",
      "Are you sure you want to delete this workout plan?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWorkoutPlan(planId);
              queryClient.invalidateQueries({
                queryKey: ["plans", selectedDay],
              });
              Alert.alert("Success", "Plan deleted successfully!");
            } catch (error) {
              Alert.alert("Error", "Failed to delete plan.");
              console.error("Failed to delete plan:", error);
            }
          },
        },
      ],
    );
  };

  const handleCancelCreating = () => {
    setIsCreatingPlan(false);
    setPlanName("");
    setPlannedExercises([]);
    setEditingPlan(null);
  };

  // T059: Start workout from plan
  const handleStartFromPlan = async (plan: WorkoutPlan) => {
    // Check if there's already an active workout
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
    <SafeAreaView className="flex-1 bg-gray-100 dark:bg-gray-950">
      <ScrollView className="p-4">
        <Text className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Workout Planning
        </Text>

        {/* T054: Week Calendar */}
        <WeekCalendar
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
          daysWithPlans={plans.length > 0 ? [selectedDay] : []}
        />

        {/* Create Plan Section */}
        {isCreatingPlan ? (
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
            <Text className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingPlan ? "Edit Plan" : "Create New Plan"}
            </Text>

            {/* T056: Plan Name Input */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Plan Name *
              </Text>
              <TextInput
                value={planName}
                onChangeText={setPlanName}
                placeholder="e.g., Leg Day, Upper Body, etc."
                placeholderTextColor="#9ca3af"
                className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white"
              />
            </View>

            {/* Planned Exercises List */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Exercises ({plannedExercises.length})
              </Text>
              {plannedExercises.length === 0 ? (
                <Text className="text-center text-gray-500 dark:text-gray-400 py-4">
                  No exercises added yet
                </Text>
              ) : (
                plannedExercises.map((exercise, index) => (
                  <View
                    key={exercise.id}
                    className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 mb-2 border border-gray-200 dark:border-gray-700"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="font-semibold text-gray-900 dark:text-white flex-1">
                        {index + 1}. {exercise.muscleGroups.join(", ")}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveExercise(exercise.id)}
                        className="bg-red-500 dark:bg-red-600 px-2 py-1 rounded"
                      >
                        <Text className="text-white text-xs font-semibold">
                          Remove
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm">
                      {exercise.machine}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-500 text-sm">
                      Target: {exercise.targetSets} sets × {exercise.targetReps}{" "}
                      reps
                    </Text>
                    {exercise.notes && (
                      <Text className="text-gray-500 dark:text-gray-500 text-sm italic mt-1">
                        {exercise.notes}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* Add Exercise Button */}
            <TouchableOpacity
              onPress={() => setShowExerciseForm(true)}
              className="bg-primary-500 dark:bg-primary-600 py-3 px-6 rounded-lg mb-3"
            >
              <Text className="text-white text-center font-semibold">
                + Add Exercise
              </Text>
            </TouchableOpacity>

            {/* Save/Cancel Buttons */}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleCancelCreating}
                className="flex-1 bg-gray-300 dark:bg-gray-700 py-3 px-6 rounded-lg"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSavePlan}
                className="flex-1 bg-green-500 dark:bg-green-600 py-3 px-6 rounded-lg"
              >
                <Text className="text-white text-center font-semibold">
                  {editingPlan ? "Update Plan" : "Save Plan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleStartCreating}
            className="bg-primary-500 dark:bg-primary-600 py-4 px-6 rounded-lg mb-6"
          >
            <Text className="text-white text-center text-lg font-semibold">
              + Create New Plan
            </Text>
          </TouchableOpacity>
        )}

        {/* T058: Display Existing Plans */}
        <View className="mb-6">
          <Text className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Plans for this Day ({plans.length})
          </Text>

          {isLoading ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" className="text-primary-600" />
            </View>
          ) : plans.length === 0 ? (
            <View className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <Text className="text-center text-gray-500 dark:text-gray-400">
                No plans for this day yet
              </Text>
            </View>
          ) : (
            plans.map((plan) => (
              <View
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 border border-gray-200 dark:border-gray-700"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1">
                    {plan.name}
                  </Text>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleEditPlan(plan)}
                      className="bg-blue-500 dark:bg-blue-600 px-3 py-1 rounded"
                    >
                      <Text className="text-white text-xs font-semibold">
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeletePlan(plan.id)}
                      className="bg-red-500 dark:bg-red-600 px-3 py-1 rounded"
                    >
                      <Text className="text-white text-xs font-semibold">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  {plan.plannedExercises.length} exercise
                  {plan.plannedExercises.length !== 1 ? "s" : ""}
                </Text>

                {/* Exercise Preview */}
                {plan.plannedExercises.slice(0, 3).map((exercise, index) => (
                  <Text
                    key={exercise.id}
                    className="text-gray-700 dark:text-gray-300 text-sm"
                  >
                    {index + 1}. {exercise.muscleGroups.join(", ")} -{" "}
                    {exercise.machine} ({exercise.targetSets}×
                    {exercise.targetReps})
                  </Text>
                ))}
                {plan.plannedExercises.length > 3 && (
                  <Text className="text-gray-500 dark:text-gray-500 text-sm italic mt-1">
                    +{plan.plannedExercises.length - 3} more
                  </Text>
                )}

                {/* T059: Start from Plan Button */}
                <TouchableOpacity
                  className="bg-primary-500 dark:bg-primary-600 py-2 px-4 rounded-lg mt-3"
                  onPress={() => handleStartFromPlan(plan)}
                >
                  <Text className="text-white text-center font-semibold">
                    Start Workout from Plan
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Exercise Form Modal */}
      <PlannedExerciseForm
        visible={showExerciseForm}
        onClose={() => setShowExerciseForm(false)}
        onSave={handleAddExercise}
      />
    </SafeAreaView>
  );
}
