import "@/assets/css/globals.css";
import { Stack } from "expo-router";
import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '@/lib/queryClient';
import { ThemeProvider } from '@/lib/hooks/useTheme';

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
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
