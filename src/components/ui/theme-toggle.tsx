"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-[50px] border border-theme bg-theme-card opacity-50 ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
      className={`relative flex items-center justify-center w-8 h-8 rounded-[50px] border border-theme bg-theme-card hover:border-theme-accent transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-theme-primary cursor-pointer ${className}`}
      title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center text-theme-primary"
      >
        {isDark ? (
          <Sun className="w-3.5 h-3.5" />
        ) : (
          <Moon className="w-3.5 h-3.5" />
        )}
      </motion.div>
    </button>
  );
}
