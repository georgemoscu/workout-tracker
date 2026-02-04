// Settings screen with theme customization
import { ScrollView, Text, View } from "react-native";
import { ThemeToggle } from "../../components/ThemeToggle";

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="p-4">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </Text>

        {/* Appearance Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
            Appearance
          </Text>
          <ThemeToggle />
        </View>

        {/* App Info Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
            About
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-600 dark:text-gray-400">Version</Text>
              <Text className="text-gray-900 dark:text-white font-medium">
                1.0.0
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 dark:text-gray-400">Build</Text>
              <Text className="text-gray-900 dark:text-white font-medium">
                001
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
