'use client';

import React, { createContext, useContext, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Always set to light mode
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    localStorage.removeItem('theme');
  }, []);

  // No-op functions - always light mode
  const setTheme = () => {};
  const toggleTheme = () => {};

  return (
    <ThemeContext.Provider value={{
      theme: 'light',
      resolvedTheme: 'light',
      setTheme,
      toggleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
