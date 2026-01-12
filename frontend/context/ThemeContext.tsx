'use client';

import React, { createContext, useContext, useEffect } from 'react';

interface ThemeContextType {
  theme: 'light';
  resolvedTheme: 'light';
  setTheme: (theme: 'light') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lock theme to light mode only
  useEffect(() => {
    const root = window.document.documentElement;

    // Always set to light mode
    root.classList.remove('dark');
    root.classList.add('light');

    // Clear any stored theme preferences
    localStorage.removeItem('theme');
  }, []);

  // Dummy functions for backward compatibility
  const setTheme = () => {
    // Always light mode, no-op
  };

  const toggleTheme = () => {
    // Always light mode, no-op
  };

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
