// Theme toggle component with switch UI for dark/light mode
import { View, Text, Switch, Pressable } from 'react-native';
import { useTheme } from '../lib/hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <View className="flex-row items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          Dark Mode
        </Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
        </Text>
      </View>
      <Switch
        value={isDark}
        onValueChange={toggleTheme}
        trackColor={{ false: '#D1D5DB', true: '#DC143C' }}
        thumbColor={isDark ? '#FFFFFF' : '#F3F4F6'}
        ios_backgroundColor="#D1D5DB"
      />
    </View>
  );
}
