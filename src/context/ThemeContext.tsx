import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
  setTheme: (isDark: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDark: () => {},
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vyapar_theme');
      if (saved) return saved === 'dark';
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('vyapar_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('vyapar_theme', 'light');
      }
    } catch (e) {
      console.warn('Theme toggle error:', e);
    }
  }, [isDark]);

  const toggleDark = () => setIsDark(prev => !prev);
  const setTheme = (val: boolean) => setIsDark(val);

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
