import { MUSCLE_GROUPS, MuscleGroup } from "@/consts/muscles";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface MuscleGroupPickerProps {
  selectedGroups: MuscleGroup[];
  onSelectionChange: (groups: MuscleGroup[]) => void;
}

export function MuscleGroupPicker({
  selectedGroups,
  onSelectionChange,
}: MuscleGroupPickerProps) {
  const toggleMuscleGroup = (muscle: MuscleGroup) => {
    const isSelected = selectedGroups.includes(muscle);
    if (isSelected) {
      onSelectionChange(selectedGroups.filter((m) => m !== muscle));
    } else {
      onSelectionChange([...selectedGroups, muscle]);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Muscle Groups *
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        <View className="flex-row flex-wrap gap-2">
          {MUSCLE_GROUPS.map((muscle) => {
            const isSelected = selectedGroups.includes(muscle);
            return (
              <TouchableOpacity
                key={muscle}
                onPress={() => toggleMuscleGroup(muscle)}
                className={`px-4 py-2 rounded-full border-2 ${
                  isSelected
                    ? "bg-primary-500 dark:bg-primary-600 border-primary-600 dark:border-primary-500"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                }`}
              >
                <Text
                  className={`font-medium ${
                    isSelected
                      ? "text-white"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {muscle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      {selectedGroups.length > 0 && (
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {selectedGroups.length} selected
        </Text>
      )}
    </View>
  );
}
