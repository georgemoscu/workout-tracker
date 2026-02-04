import { GymMachine } from "@/consts/machines";
import { MuscleGroup } from "@/consts/muscles";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MachinePicker } from "./MachinePicker";
import { MuscleGroupPicker } from "./MuscleGroupPicker";

interface PlannedExerciseFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: {
    muscleGroups: MuscleGroup[];
    machine: GymMachine;
    targetSets: number;
    targetReps: number;
    notes: string | null;
  }) => void;
  initialData?: {
    muscleGroups: MuscleGroup[];
    machine: GymMachine | null;
    targetSets: number;
    targetReps: number;
    notes: string | null;
  };
}

export function PlannedExerciseForm({
  visible,
  onClose,
  onSave,
  initialData,
}: PlannedExerciseFormProps) {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(
    initialData?.muscleGroups || [],
  );
  const [machine, setMachine] = useState<GymMachine | null>(
    initialData?.machine || null,
  );
  const [targetSets, setTargetSets] = useState<string>(
    initialData?.targetSets.toString() || "3",
  );
  const [targetReps, setTargetReps] = useState<string>(
    initialData?.targetReps.toString() || "10",
  );
  const [notes, setNotes] = useState<string>(initialData?.notes || "");

  const handleSave = () => {
    // Validation
    if (muscleGroups.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please select at least one muscle group.",
      );
      return;
    }

    if (!machine) {
      Alert.alert("Validation Error", "Please select equipment.");
      return;
    }

    const setsNum = parseInt(targetSets, 10);
    const repsNum = parseInt(targetReps, 10);

    if (isNaN(setsNum) || setsNum <= 0) {
      Alert.alert("Validation Error", "Target sets must be greater than 0.");
      return;
    }

    if (setsNum > 20) {
      Alert.alert("Validation Error", "Maximum 20 sets allowed.");
      return;
    }

    if (isNaN(repsNum) || repsNum <= 0) {
      Alert.alert("Validation Error", "Target reps must be greater than 0.");
      return;
    }

    onSave({
      muscleGroups,
      machine,
      targetSets: setsNum,
      targetReps: repsNum,
      notes: notes.trim() || null,
    });

    // Reset form
    setMuscleGroups([]);
    setMachine(null);
    setTargetSets("3");
    setTargetReps("10");
    setNotes("");
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setMuscleGroups(initialData?.muscleGroups || []);
    setMachine(initialData?.machine || null);
    setTargetSets(initialData?.targetSets.toString() || "3");
    setTargetReps(initialData?.targetReps.toString() || "10");
    setNotes(initialData?.notes || "");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View className="flex-1 bg-gray-100 dark:bg-gray-950">
        {/* Header */}
        <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={handleCancel}>
            <Text className="text-primary-600 dark:text-primary-400 text-lg font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            Add Planned Exercise
          </Text>
          <TouchableOpacity onPress={handleSave}>
            <Text className="text-primary-600 dark:text-primary-400 text-lg font-semibold">
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView className="flex-1 p-4">
          {/* Muscle Groups */}
          <MuscleGroupPicker
            selectedGroups={muscleGroups}
            onSelectionChange={setMuscleGroups}
          />

          {/* Equipment/Machine */}
          <MachinePicker
            selectedMachine={machine}
            onSelectionChange={setMachine}
          />

          {/* Target Sets & Reps */}
          <View className="mb-4">
            <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Target Sets & Reps *
            </Text>
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Sets
                </Text>
                <TextInput
                  value={targetSets}
                  onChangeText={setTargetSets}
                  keyboardType="numeric"
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-900 dark:text-white text-center font-semibold"
                  placeholder="3"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Reps per Set
                </Text>
                <TextInput
                  value={targetReps}
                  onChangeText={setTargetReps}
                  keyboardType="numeric"
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-900 dark:text-white text-center font-semibold"
                  placeholder="10"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>

          {/* Notes (Optional) */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Notes (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add planning notes..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-900 dark:text-white"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}
