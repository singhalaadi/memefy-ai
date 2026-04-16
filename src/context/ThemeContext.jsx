import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("theme");
        return saved ? JSON.parse(saved) : true;
      } catch (error) {
        console.error('Error reading theme from localStorage:', error);
        return true;
      }
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem("theme", JSON.stringify(isDarkMode));
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
    }
    
    if (typeof document !== 'undefined') {
      document.body.style.transition = "background 0.5s ease, color 0.3s ease";

      if (isDarkMode) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        document.body.style.background =
          "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)";
        document.body.style.color = "#ffffff";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        document.body.style.background =
          "linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 50%, #f8fafc 100%)";
        document.body.style.color = "#1f2937";
      }
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
