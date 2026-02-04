// Theme hook and context for dark/light mode switching
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getSettings, saveSettings } from '../storage/settingsStorage';
import type { ThemeMode } from '../storage/types';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    getSettings().then((settings) => {
      setThemeState(settings.theme);
      setIsLoaded(true);
    });
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!isLoaded) return;

    // Add/remove dark class for Tailwind dark mode
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, isLoaded]);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    const settings = await getSettings();
    await saveSettings({ ...settings, theme: newTheme });
  };

  const toggleTheme = async () => {
    const newTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  // if (!isLoaded) {
  //   // Return null or loading component during initial load
  //   return null;
  // }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
