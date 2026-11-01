"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import Lenis from "lenis";

export interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  lock?: boolean;
  onComplete?: (lenis: Lenis) => void;
}

export interface LenisContextValue {
  lenis: Lenis | null;
  scrollTo: (
    target: string | number | HTMLElement,
    options?: ScrollToOptions
  ) => void;
  scrollProgress: number;
}

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
  scrollProgress: 0,
});

/**
 * Hook to access Lenis instance and stable scrollTo method.
 * Calling useLenis() does NOT trigger re-renders on scroll frames, guaranteeing 120fps/60fps.
 */
export function useLenis() {
  return useContext(LenisContext);
}

/**
 * Dedicated scroll listener hook that executes safely without triggering render loops.
 * Uses a ref to ensure the listener callback is always up to date.
 */
export function useLenisScroll(
  callback: (e: {
    scroll: number;
    limit: number;
    velocity: number;
    direction: number;
    progress: number;
  }) => void
) {
  const { lenis } = useLenis();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!lenis) return;
    const handler = (e: {
      scroll: number;
      limit: number;
      velocity: number;
      direction: number;
      progress: number;
    }) => {
      callbackRef.current(e);
    };
    lenis.on("scroll", handler);
    return () => {
      lenis.off("scroll", handler);
    };
  }, [lenis]);
}

/**
 * Hook for leaf UI indicators that specifically need continuous scroll progress (0 to 1).
 * Isolates re-renders exclusively to the component invoking this hook.
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useLenisScroll((e) => {
    setProgress(e.progress);
  });

  return progress;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Check accessibility reduced-motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Instantiate Lenis with exponential ease-out physics
    const lenis = new Lenis({
      duration: prefersReducedMotion ? 0 : 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !prefersReducedMotion,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
      autoResize: true,
      prevent: (node: HTMLElement) => {
        return (
          node.classList?.contains("lenis-prevent") ||
          node.hasAttribute("data-lenis-prevent") ||
          !!node.closest?.("[data-lenis-prevent]")
        );
      },
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    if (typeof window !== "undefined") {
      (window as unknown as { lenis: Lenis }).lenis = lenis;
    }

    // High performance RAF loop
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Global in-page smooth hash anchor link interceptor (#section)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const elem = document.querySelector(href);
        if (elem) {
          e.preventDefault();
          lenis.scrollTo(elem as HTMLElement, {
            offset: -70,
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      if (typeof window !== "undefined") {
        delete (window as unknown as { lenis?: Lenis }).lenis;
      }
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | number | HTMLElement, options?: ScrollToOptions) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, {
          offset: options?.offset ?? -70,
          duration: options?.duration ?? 1.2,
          immediate: options?.immediate ?? false,
          lock: options?.lock ?? false,
          onComplete: options?.onComplete,
        });
      } else {
        if (typeof target === "number") {
          window.scrollTo({
            top: target,
            behavior: options?.immediate ? "auto" : "smooth",
          });
        } else if (typeof target === "string") {
          const elem = document.querySelector(target);
          elem?.scrollIntoView({
            behavior: options?.immediate ? "auto" : "smooth",
          });
        } else if (target instanceof HTMLElement) {
          target.scrollIntoView({
            behavior: options?.immediate ? "auto" : "smooth",
          });
        }
      }
    },
    []
  );

  // Stable context value: lenis instance + scrollTo method
  // scrollProgress is a getter so accessing it does not cause re-render loops.
  const contextValue = useMemo<LenisContextValue>(() => {
    return {
      lenis: lenisInstance,
      scrollTo,
      get scrollProgress() {
        return lenisRef.current?.progress ?? 0;
      },
    };
  }, [lenisInstance, scrollTo]);

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
}
