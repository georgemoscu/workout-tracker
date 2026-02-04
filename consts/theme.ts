// Theme configuration constants
export const THEME = {
  primary: {
    50: "#FFE5E5",
    100: "#FFB3B3",
    200: "#FF8080",
    300: "#FF4D4D",
    400: "#FF1A1A",
    500: "#DC143C", // Crimson (main dark red)
    600: "#B22222", // Firebrick
    700: "#8B0000", // Dark red
    800: "#660000",
    900: "#400000",
  },
} as const;

export type ThemeMode = "light" | "dark";
