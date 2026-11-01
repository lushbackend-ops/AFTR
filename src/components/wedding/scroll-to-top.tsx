"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useLenis, useLenisScroll } from "@/components/providers/lenis-provider";

export function ScrollToTop() {
  const { scrollTo } = useLenis();
  const [isVisible, setIsVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  useLenisScroll((e) => {
    setIsVisible(e.scroll > 300);
    setProgressPercent(Math.min(100, Math.max(0, Math.round(e.progress * 100))));
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.button
            onClick={() => scrollTo(0, { duration: 1.2 })}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-[50px] border border-theme bg-theme-card text-theme-primary hover:border-theme-accent shadow-xl focus:outline-none cursor-pointer"
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-3.5 h-3.5 text-theme-primary" />
            <span className="font-sans text-[11px] tracking-widest text-theme-secondary">
              {progressPercent}%
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
