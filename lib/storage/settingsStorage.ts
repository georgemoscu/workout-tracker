// Settings storage operations with AsyncStorage
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserSettings } from "./types";

const SETTINGS_KEY = "settings:preferences";

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  theme: "dark",
  notifications: true,
};

export async function getSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // Return defaults if no settings exist
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error getting settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
    throw error;
  }
}
