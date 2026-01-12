'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-accent/20 transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          scale: resolvedTheme === 'dark' ? 1 : 0,
          opacity: resolvedTheme === 'dark' ? 1 : 0,
          rotate: resolvedTheme === 'dark' ? 0 : 180,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Sun className="w-5 h-5 text-foreground" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: resolvedTheme === 'light' ? 1 : 0,
          opacity: resolvedTheme === 'light' ? 1 : 0,
          rotate: resolvedTheme === 'light' ? 0 : -180,
        }}
        transition={{ duration: 0.2 }}
        className="absolute"
      >
        <Moon className="w-5 h-5 text-foreground" />
      </motion.div>
    </motion.button>
  );
}
