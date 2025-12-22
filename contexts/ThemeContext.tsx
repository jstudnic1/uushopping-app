import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import Colors from "@/constants/colors";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("light");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load persisted theme or fall back to system
    AsyncStorage.getItem("user_theme").then((storedTheme) => {
      if (storedTheme === "light" || storedTheme === "dark") {
        setThemeState(storedTheme);
      } else {
        setThemeState(systemColorScheme === "dark" ? "dark" : "light");
      }
      setIsReady(true);
    });
  }, [systemColorScheme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setThemeState(newTheme);
    AsyncStorage.setItem("user_theme", newTheme);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    AsyncStorage.setItem("user_theme", newTheme);
  };

  const colors = theme === "light" ? Colors.light : Colors.dark;

  // Render children only after theme is loaded to avoid flash
  if (!isReady) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
