"use client";

import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

interface ScrollLineProps {
  direction?: "horizontal" | "vertical";
  origin?: "left" | "center" | "right" | "top" | "bottom";
  className?: string;
  trackColor?: string;
  activeColor?: string;
  thickness?: number;
}

/**
 * Award-winning Scroll-Reactive Line
 * Dynamically draws itself from 0% to 100% as its container scrolls into view.
 */
export function ScrollLine({
  direction = "horizontal",
  origin = "left",
  className = "",
  trackColor = "var(--color-border-subtle)",
  activeColor = "var(--color-line-drawing)",
  thickness = 1,
}: ScrollLineProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "center 50%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  const isHorizontal = direction === "horizontal";

  const originStyles: Record<string, string> = {
    left: "0% 50%",
    center: "50% 50%",
    right: "100% 50%",
    top: "50% 0%",
    bottom: "50% 100%",
  };

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        height: isHorizontal ? `${thickness}px` : "100%",
        width: isHorizontal ? "100%" : `${thickness}px`,
        backgroundColor: trackColor,
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundColor: activeColor,
          transformOrigin: originStyles[origin] || "0% 50%",
          scaleX: isHorizontal ? smoothProgress : 1,
          scaleY: isHorizontal ? 1 : smoothProgress,
        }}
      />
    </div>
  );
}

/**
 * Editorial Section Divider with Crosshair Accents & Scroll Line
 */
export function SectionScrollDivider({
  label,
  number,
  className = "",
}: {
  label?: string;
  number?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 92%", "center 55%"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 22,
    restDelta: 0.001,
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.3, 0.7, 1]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full py-6 flex flex-col justify-center ${className}`}
    >
      {(label || number) && (
        <div className="flex items-center justify-between text-[10px] font-sans tracking-[0.3em] uppercase text-theme-tertiary pb-3">
          <span>{number}</span>
          <span>{label}</span>
        </div>
      )}

      <div className="relative w-full h-[1px] bg-theme-border-subtle flex items-center">
        {/* Left Crosshair Tick */}
        <span className="absolute -left-1 text-theme-tertiary text-xs leading-none select-none">
          +
        </span>

        {/* Dynamic Expanding Hairline */}
        <motion.div
          className="absolute inset-y-0 left-0 right-0 bg-theme-primary origin-left"
          style={{
            scaleX,
            opacity,
            backgroundColor: "var(--color-line-drawing)",
          }}
        />

        {/* Right Crosshair Tick */}
        <span className="absolute -right-1 text-theme-tertiary text-xs leading-none select-none">
          +
        </span>
      </div>
    </div>
  );
}

/**
 * Global Top Reading Progress Hairline
 * Subtly tracks the page scroll progress with Apple-grade smooth spring physics.
 */
export function GlobalReadingProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none bg-transparent">
      <motion.div
        className="h-full origin-left"
        style={{
          scaleX,
          backgroundColor: "var(--color-line-drawing)",
          boxShadow: "0 0 8px var(--color-line-drawing)",
        }}
      />
    </div>
  );
}

/**
 * Outer Frame Vertical Scroll Guides
 * Frames the 7xl max-width container with vertical hairlines that draw down as the user scrolls.
 */
export function FramingScrollLines() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-10 max-w-7xl mx-auto px-6 sm:px-12">
      {/* Left Vertical Frame Line */}
      <div className="absolute top-0 bottom-0 left-6 sm:left-12 w-[1px] bg-transparent">
        <div className="w-full h-full bg-theme-border-subtle opacity-30" />
        <motion.div
          className="absolute top-0 left-0 w-full h-full origin-top"
          style={{
            scaleY,
            backgroundColor: "var(--color-border-default)",
          }}
        />
      </div>

      {/* Right Vertical Frame Line */}
      <div className="absolute top-0 bottom-0 right-6 sm:right-12 w-[1px] bg-transparent">
        <div className="w-full h-full bg-theme-border-subtle opacity-30" />
        <motion.div
          className="absolute top-0 left-0 w-full h-full origin-top"
          style={{
            scaleY,
            backgroundColor: "var(--color-border-default)",
          }}
        />
      </div>
    </div>
  );
}
