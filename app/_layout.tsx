import "@/assets/css/globals.css";
import { ThemeProvider } from "@/lib/hooks/useTheme";
import { asyncStoragePersister, queryClient } from "@/lib/queryClient";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <ThemeProvider>
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
          <Stack.Screen
            name="settings/index"
            options={{
              title: "Settings",
              headerShown: false,
            }}
          />
        </Stack>
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
