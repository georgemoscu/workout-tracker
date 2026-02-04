import { GymMachine } from "@/consts/machines";
import { MuscleGroup } from "@/consts/muscles";
import { SetEntry } from "@/lib/storage/types";
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
import { SetInput } from "./SetInput";

interface ExerciseFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (exercise: {
    muscleGroups: MuscleGroup[];
    machine: GymMachine;
    sets: SetEntry[];
    notes: string | null;
  }) => void;
  initialData?: {
    muscleGroups: MuscleGroup[];
    machine: GymMachine | null;
    sets: SetEntry[];
    notes: string | null;
  };
}

export function ExerciseForm({
  visible,
  onClose,
  onSave,
  initialData,
}: ExerciseFormProps) {
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(
    initialData?.muscleGroups || [],
  );
  const [machine, setMachine] = useState<GymMachine | null>(
    initialData?.machine || null,
  );
  const [sets, setSets] = useState<SetEntry[]>(initialData?.sets || []);
  const [notes, setNotes] = useState<string>(initialData?.notes || "");

  const handleSave = () => {
    // T039: Comprehensive validation

    // Minimum 1 muscle group
    if (muscleGroups.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please select at least one muscle group.",
      );
      return;
    }

    // Machine is required
    if (!machine) {
      Alert.alert("Validation Error", "Please select equipment.");
      return;
    }

    // Minimum 1 set
    if (sets.length === 0) {
      Alert.alert("Validation Error", "Please add at least one set.");
      return;
    }

    // Maximum 20 sets
    if (sets.length > 20) {
      Alert.alert("Validation Error", "Maximum 20 sets allowed per exercise.");
      return;
    }

    // All reps must be > 0
    const hasInvalidReps = sets.some((set) => set.reps <= 0);
    if (hasInvalidReps) {
      Alert.alert(
        "Validation Error",
        "All sets must have reps greater than 0.",
      );
      return;
    }

    onSave({
      muscleGroups,
      machine,
      sets,
      notes: notes.trim() || null,
    });

    // Reset form
    setMuscleGroups([]);
    setMachine(null);
    setSets([]);
    setNotes("");
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setMuscleGroups(initialData?.muscleGroups || []);
    setMachine(initialData?.machine || null);
    setSets(initialData?.sets || []);
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
            Add Exercise
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

          {/* Sets & Reps */}
          <SetInput sets={sets} onSetsChange={setSets} />

          {/* Notes (Optional) */}
          <View className="mb-6">
            <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Notes (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this exercise..."
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
