import { GYM_MACHINES, GymMachine } from "@/consts/machines";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface MachinePickerProps {
  selectedMachine: GymMachine | null;
  onSelectionChange: (machine: GymMachine) => void;
}

export function MachinePicker({
  selectedMachine,
  onSelectionChange,
}: MachinePickerProps) {
  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Equipment *
      </Text>
      <ScrollView className="max-h-48" showsVerticalScrollIndicator={true}>
        <View className="gap-2">
          {GYM_MACHINES.map((machine) => {
            const isSelected = selectedMachine === machine;
            return (
              <TouchableOpacity
                key={machine}
                onPress={() => onSelectionChange(machine)}
                className={`px-4 py-3 rounded-lg border-2 ${
                  isSelected
                    ? "bg-primary-50 dark:bg-primary-900/30 border-primary-500 dark:border-primary-600"
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                }`}
              >
                <Text
                  className={`font-medium ${
                    isSelected
                      ? "text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {machine}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
