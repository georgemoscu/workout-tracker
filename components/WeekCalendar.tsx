import { Text, TouchableOpacity, View } from "react-native";

interface WeekCalendarProps {
  selectedDay: number; // 0-6 (Sunday=0, Monday=1, ..., Saturday=6)
  onDaySelect: (day: number) => void;
  daysWithPlans?: number[]; // Array of days that have plans
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function WeekCalendar({
  selectedDay,
  onDaySelect,
  daysWithPlans = [],
}: WeekCalendarProps) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
        Select Day
      </Text>
      <View className="flex-row justify-between gap-2">
        {DAYS.map((day, index) => {
          const isSelected = selectedDay === index;
          const hasPlan = daysWithPlans.includes(index);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDaySelect(index)}
              className={`flex-1 items-center py-3 rounded-lg border-2 ${
                isSelected
                  ? "bg-primary-500 dark:bg-primary-600 border-primary-600 dark:border-primary-500"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              }`}
            >
              <Text
                className={`font-bold text-sm ${
                  isSelected ? "text-white" : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {day}
              </Text>
              {hasPlan && !isSelected && (
                <View className="mt-1 w-1.5 h-1.5 rounded-full bg-primary-500 dark:bg-primary-400" />
              )}
              {hasPlan && isSelected && (
                <View className="mt-1 w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <Text className="text-center text-gray-600 dark:text-gray-400 mt-2">
        {FULL_DAYS[selectedDay]}
      </Text>
    </View>
  );
}
