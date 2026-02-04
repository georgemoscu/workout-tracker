# Quickstart: Workout Tracker Development

**Feature**: Workout Management System
**Branch**: `001-workout-management`
**Date**: 2026-02-04

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+ or **yarn**: v1.22+
- **Expo CLI**: Installed globally (optional, can use npx)
- **iOS**: Xcode 14+ with iOS Simulator (Mac only)
- **Android**: Android Studio with emulator or physical device
- **Expo Go**: Mobile app (for quick testing)

## Initial Setup

### 1. Clone Repository & Install Dependencies

```bash
git clone <repository-url>
cd workout-tracker
git checkout 001-workout-management
npm install
```

**Expected Output**:

- ~50 packages installed
- No peer dependency warnings
- Expo SDK ~54.0 confirmed

### 2. Verify Environment

```bash
# Check Node version
node --version  # Should show v18+

# Check Expo
npx expo --version  # Should show ~54.0

# Verify TypeScript
npx tsc --version  # Should show 5.9+
```

### 3. Start Development Server

```bash
npm start
# or
npx expo start
```

**Expected Output**:

```
Metro waiting on exp://192.168.x.x:8081
› Press a | open Android
› Press i | open iOS simulator
› Press w | open web
› Press r | reload app
```

### 4. Run on Simulator/Device

**iOS (Mac only)**:

```bash
npm run ios
# or press 'i' in Metro terminal
```

**Android**:

```bash
npm run android
# or press 'a' in Metro terminal
```

**Expo Go** (Easiest for quick testing):

1. Install Expo Go from App Store / Play Store
2. Scan QR code shown in terminal
3. App loads on physical device

---

## Project Structure Overview

```
workout-tracker/
├── app/                        # Screens (Expo Router)
│   ├── _layout.tsx            # Root layout + theme provider
│   ├── index.tsx              # Home screen (Start Workout)
│   ├── start-workout.tsx      # Active workout session
│   ├── plan-workout.tsx       # Workout planning
│   ├── history/               # History screens (stack)
│   └── settings/              # Settings screens
│
├── components/                 # Reusable UI components
│   ├── ExerciseForm.tsx       # Exercise input form
│   ├── WorkoutTimer.tsx       # Timer with pause/resume
│   └── ...
│
├── lib/                       # Business logic & utilities
│   ├── storage/               # AsyncStorage operations
│   │   ├── workoutStorage.ts  # Workout CRUD
│   │   ├── settingsStorage.ts # Settings persistence
│   │   └── types.ts           # TypeScript interfaces
│   ├── hooks/                 # Custom React hooks
│   │   ├── useWorkouts.ts     # TanStack Query hooks
│   │   ├── useActiveWorkout.ts
│   │   └── useTheme.ts
│   └── utils/                 # Helper functions
│
├── consts/                    # Constants (muscles, machines)
│   ├── muscles.ts
│   ├── machines.ts
│   └── theme.ts
│
├── assets/                    # Static assets
│   ├── css/globals.css
│   └── images/
│
├── types/                     # Global TypeScript types
│   └── index.ts
│
├── specs/                     # Feature specifications
│   └── 001-workout-management/
│       ├── spec.md
│       ├── plan.md
│       ├── data-model.md
│       └── contracts/
│
├── package.json
├── tsconfig.json
├── tailwind.config.js         # Tailwind + dark red theme
└── app.json                   # Expo configuration
```

---

## Development Workflow

### Creating a New Screen

1. **Create file** in `app/` directory:

```typescript
// app/new-screen.tsx
export default function NewScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <Text className="text-primary-600 dark:text-primary-400">
        New Screen
      </Text>
    </View>
  );
}
```

2. **Navigation**: File-based, auto-configured by Expo Router

```typescript
// Navigate from another screen
import { router } from "expo-router";
router.push("/new-screen");
```

### Creating a New Component

1. **Create file** in `components/`:

```typescript
// components/MyComponent.tsx
import { View, Text } from 'react-native';

interface MyComponentProps {
  title: string;
  onPress: () => void;
}

export default function MyComponent({ title, onPress }: MyComponentProps) {
  return (
    <View className="p-4 bg-primary-500">
      <Text className="text-white">{title}</Text>
    </View>
  );
}
```

2. **Import and use**:

```typescript
import MyComponent from '@/components/MyComponent';

<MyComponent title="Hello" onPress={() => {}} />
```

### Working with AsyncStorage

1. **Import storage functions**:

```typescript
import {
  getActiveWorkout,
  saveActiveWorkout,
} from "@/lib/storage/workoutStorage";
```

2. **Use with TanStack Query**:

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";

const { data: activeWorkout } = useQuery({
  queryKey: ["workout", "active"],
  queryFn: getActiveWorkout,
});

const saveMutation = useMutation({
  mutationFn: saveActiveWorkout,
  onSuccess: () => {
    // Invalidate queries
  },
});
```

### Styling with Tailwind

**Utility classes** (NativeWind):

```tsx
<View className="flex-1 p-4 bg-white dark:bg-gray-900">
  <Text className="text-2xl font-bold text-primary-600 dark:text-primary-400">
    Title
  </Text>
  <Button className="bg-primary-500 px-6 py-3 rounded-lg">Press Me</Button>
</View>
```

**Theme toggle**:

```typescript
import { useTheme } from "@/lib/hooks/useTheme";

const { theme, toggleTheme } = useTheme();
// theme is 'light' or 'dark'
```

---

## Key Commands

| Command                      | Description                     |
| ---------------------------- | ------------------------------- |
| `npm start`                  | Start Metro bundler             |
| `npm run ios`                | Run on iOS simulator            |
| `npm run android`            | Run on Android emulator         |
| `npm run web`                | Run in web browser              |
| `npm run lint`               | Run ESLint                      |
| `npx expo install <package>` | Install Expo-compatible package |

---

## Configuration Files

### tailwind.config.js

**Dark red theme** configuration:

```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFE5E5",
          500: "#DC143C", // Crimson
          600: "#B22222", // Firebrick
          700: "#8B0000", // Dark Red
          900: "#400000",
        },
      },
    },
  },
  plugins: [],
};
```

### tsconfig.json

**TypeScript strict mode** enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## Debugging

### React Native Debugger

1. Install: `brew install --cask react-native-debugger` (Mac)
2. Open app at `localhost:19000`
3. Enable Remote JS Debugging in app Dev Menu (shake device)

### Metro Bundler Issues

**Clear cache**:

```bash
npx expo start --clear
```

**Reset completely**:

```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### AsyncStorage Inspection

**React Native Debugger** → Storage tab → AsyncStorage

Or use `@react-native-async-storage/async-storage-dev-menu`:

```bash
npm install --save-dev @react-native-async-storage/async-storage-dev-menu
```

### Theme Not Updating

- Ensure `dark` class applied to root element
- Check `useTheme` hook connected to context
- Verify Tailwind classes include `dark:` variants
- Restart Metro if hot reload fails

---

## Common Issues & Solutions

### Issue: "Unable to resolve module"

**Solution**: Install missing dependency

```bash
npx expo install <missing-package>
```

### Issue: iOS build fails with "No bundle URL present"

**Solution**: Reset Metro bundler

```bash
npx expo start --clear
npm run ios
```

### Issue: Android emulator won't connect

**Solution**: Check ADB connection

```bash
adb devices  # Should show emulator
adb reverse tcp:8081 tcp:8081  # Forward Metro port
```

### Issue: TypeScript errors in IDE but build works

**Solution**: Restart TypeScript server

- VS Code: Cmd+Shift+P → "Restart TypeScript Server"
- Or restart IDE

---

## Testing Strategy (Manual)

**Per constitution, no automated tests.** Follow manual testing checklist:

### P1: Quick Workout Start (2 taps)

1. Launch app
2. Tap "Start Workout" button
3. **Verify**: Timer starts at 00:00
4. **Verify**: Active workout screen loads
5. **Verify**: Total taps = 2 from launch to timer running

### P2: Exercise Logging

1. In active workout, tap "Add Exercise"
2. Select muscle group (can select multiple)
3. Select machine from list
4. Add sets with reps (10, 8, 12)
5. Tap "Save"
6. **Verify**: Exercise appears in workout list

### P3: Force-Close Recovery

1. Start workout, add exercise
2. Force-close app (swipe away in app switcher)
3. Reopen app
4. **Verify**: Recovery modal appears
5. Tap "Resume"
6. **Verify**: Workout resumes with all data intact

### P5: Theme Switching

1. Navigate to Settings
2. Toggle theme switch
3. **Verify**: App immediately switches theme
4. Close and reopen app
5. **Verify**: Theme persists

---

## Performance Monitoring

### Metro Bundler Performance

```bash
npx expo start --no-dev --minify
# Check bundle size and load time
```

### Frame Rate Monitoring

- Enable "Show Perf Monitor" in Dev Menu
- Target: 60 FPS during interactions
- Monitor during timer updates (should stay at 60 FPS)

---

## Next Steps

1. **Implement P1**: Start workout flow (home → active session)
2. **Implement P2**: Exercise form and logging
3. **Test on device**: Use Expo Go for real-world testing
4. **Iterate**: Based on manual testing feedback

---

## Helpful Resources

- **Expo Docs**: https://docs.expo.dev/
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **NativeWind**: https://www.nativewind.dev/
- **TanStack Query**: https://tanstack.com/query/latest/docs/react/overview
- **AsyncStorage**: https://react-native-async-storage.github.io/async-storage/

---

## Support

**Issues?** Check:

1. This quickstart guide
2. Spec files in `specs/001-workout-management/`
3. Expo documentation
4. Project README.md

**Feature Questions?** Refer to:

- [spec.md](../spec.md) - User stories and requirements
- [data-model.md](../data-model.md) - Entity definitions
- [contracts/storage-api.md](../contracts/storage-api.md) - Storage operations

---

**Last Updated**: 2026-02-04
**Version**: 1.0.0
