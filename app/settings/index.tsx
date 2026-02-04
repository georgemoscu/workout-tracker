// Settings screen with theme customization
import { requestNotificationPermissions } from "@/lib/hooks/useNotification";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ThemeToggle } from "../../components/ThemeToggle";

export default function SettingsScreen() {
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

  // T075: Request notification permissions
  const handleRequestNotifications = async () => {
    setIsRequestingPermissions(true);
    try {
      const granted = await requestNotificationPermissions();
      if (granted) {
        Alert.alert(
          "Success",
          "Notification permissions granted! You'll receive alerts when your workout reaches 3 hours.",
        );
      } else {
        Alert.alert(
          "Permissions Denied",
          "Notification permissions are required to receive workout duration alerts. Please enable them in your device settings.",
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to request notification permissions.");
      console.error("Notification permission error:", error);
    } finally {
      setIsRequestingPermissions(false);
    }
  };

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

        {/* Notifications Section */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wide">
            Notifications
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <View className="mb-2">
              <Text className="text-base font-semibold text-gray-900 dark:text-white">
                Workout Duration Alerts
              </Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Get notified after 3 hours of continuous workout
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRequestNotifications}
              disabled={isRequestingPermissions}
              className="bg-primary-500 dark:bg-primary-600 py-3 px-4 rounded-lg mt-3 active:opacity-80 disabled:opacity-50"
            >
              <Text className="text-white text-center font-semibold">
                {isRequestingPermissions
                  ? "Requesting..."
                  : "Enable Notifications"}
              </Text>
            </TouchableOpacity>
          </View>
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
