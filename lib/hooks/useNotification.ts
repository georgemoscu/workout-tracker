// Notification hook for workout duration alerts
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import type { Workout } from "../storage/types";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// T075: Request notification permissions
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("workout-alerts", {
        name: "Workout Alerts",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#DC143C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Notification permissions not granted");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

// T077: Schedule 3-hour workout notification
export async function scheduleWorkoutDurationNotification(
  workout: Workout,
): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Cancel any existing workout notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Calculate time until 3-hour mark
    const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
    const elapsedTime = workout.accumulatedTime * 1000; // Convert seconds to milliseconds
    const timeUntilThreeHours = threeHours - elapsedTime;

    if (timeUntilThreeHours <= 0) {
      // Already past 3 hours, don't schedule
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🏋️ Workout Duration Alert",
        body: "You've been working out for 3 hours! Consider taking a break.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { workoutId: workout.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.floor(timeUntilThreeHours / 1000),
        repeats: false,
      },
    });

    return notificationId;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

// Cancel all workout notifications
export async function cancelWorkoutNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling notifications:", error);
  }
}

// Hook for managing workout notifications
export function useNotification(activeWorkout: Workout | null | undefined) {
  const notificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeWorkout && activeWorkout.status === "in-progress") {
      // T077: Schedule notification when workout is active
      scheduleWorkoutDurationNotification(activeWorkout).then((id) => {
        notificationIdRef.current = id;
      });
    } else {
      // Cancel notifications when workout stops
      if (notificationIdRef.current) {
        cancelWorkoutNotifications();
        notificationIdRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      cancelWorkoutNotifications();
    };
  }, [activeWorkout]);

  return {
    requestPermissions: requestNotificationPermissions,
    scheduleNotification: scheduleWorkoutDurationNotification,
    cancelNotifications: cancelWorkoutNotifications,
  };
}
