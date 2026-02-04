import "@/assets/css/globals.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Workouts",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="plan-workout"
        options={{
          title: "Plan Workout",
          headerShown: false,
          presentation: "formSheet",
          sheetAllowedDetents: [0.5, 1],
          sheetGrabberVisible: true,
          sheetCornerRadius: 16,
        }}
      />
      <Stack.Screen
        name="start-workout"
        options={{
          title: "Start Workout",
          headerShown: false,
          presentation: "formSheet",
          sheetAllowedDetents: "fitToContents",
          sheetGrabberVisible: true,
          sheetCornerRadius: 16,
        }}
      />
      <Stack.Screen
        name="quick-start"
        options={{
          title: "Quick Start",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="workout/[id]"
        options={{
          title: "Workout Details",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
