import { SetEntry } from "@/lib/storage/types";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

interface SetInputProps {
  sets: SetEntry[];
  onSetsChange: (sets: SetEntry[]) => void;
}

export function SetInput({ sets, onSetsChange }: SetInputProps) {
  const addSet = () => {
    if (sets.length >= 20) return; // Maximum 20 sets

    const newSet: SetEntry = {
      id: `set-${Date.now()}-${Math.random()}`,
      reps: 10, // Default value
      order: sets.length,
      weight: null,
    };
    onSetsChange([...sets, newSet]);
  };

  const removeSet = (index: number) => {
    const newSets = sets.filter((_, i) => i !== index);
    // Reorder remaining sets
    const reorderedSets = newSets.map((set, i) => ({
      ...set,
      order: i,
    }));
    onSetsChange(reorderedSets);
  };

  const updateReps = (index: number, reps: string) => {
    const repsNum = parseInt(reps, 10);
    if (isNaN(repsNum) || repsNum < 0) return;

    const newSets = [...sets];
    newSets[index] = { ...newSets[index], reps: repsNum };
    onSetsChange(newSets);
  };

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Sets & Reps *
        </Text>
        <TouchableOpacity
          onPress={addSet}
          disabled={sets.length >= 20}
          className={`px-4 py-2 rounded-lg ${
            sets.length >= 20
              ? "bg-gray-300 dark:bg-gray-700"
              : "bg-primary-500 dark:bg-primary-600"
          }`}
        >
          <Text className="text-white font-semibold">+ Add Set</Text>
        </TouchableOpacity>
      </View>

      {sets.length === 0 && (
        <Text className="text-center text-gray-500 dark:text-gray-400 py-4">
          No sets added yet. Tap "+ Add Set" to begin.
        </Text>
      )}

      <View className="gap-3">
        {sets.map((set, index) => (
          <View
            key={set.id}
            className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
          >
            <Text className="text-gray-700 dark:text-gray-300 font-medium w-16">
              Set {index + 1}
            </Text>

            <View className="flex-1 flex-row items-center">
              <TextInput
                value={set.reps.toString()}
                onChangeText={(text) => updateReps(index, text)}
                keyboardType="numeric"
                className="flex-1 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-gray-900 dark:text-white text-center font-semibold"
                placeholder="Reps"
                placeholderTextColor="#9ca3af"
              />
              <Text className="ml-2 text-gray-600 dark:text-gray-400">
                reps
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeSet(index)}
              className="ml-3 bg-red-500 dark:bg-red-600 px-3 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {sets.length > 0 && (
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {sets.length} set{sets.length !== 1 ? "s" : ""} added
          {sets.length >= 20 && " (maximum reached)"}
        </Text>
      )}
    </View>
  );
}
