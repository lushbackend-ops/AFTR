"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useLenis, useLenisScroll } from "@/components/providers/lenis-provider";
import { Menu, X } from "lucide-react";

export function WeddingNavbar() {
  const { scrollTo } = useLenis();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useLenisScroll((e) => {
    setIsScrolled(e.scroll > 40);
    setScrollProgress(e.progress);
  });

  const handleNavClick = (id: string) => {
    setMenuOpen(false);
    scrollTo(id, { offset: -70, duration: 1.3 });
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "apple-liquid-glass py-3 border-b border-[#333333]"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
          {/* Brand Monogram */}
          <button
            onClick={() => scrollTo(0, { duration: 1.2 })}
            className="text-left group focus:outline-none"
            aria-label="Scroll to top"
          >
            <span className="font-mincho text-sm tracking-[0.25em] uppercase text-white/90 group-hover:text-white transition-colors block">
              Wedding Invitation
            </span>
            <span className="font-sans text-[11px] text-[#888888] tracking-widest block font-light">
              Yuri &amp; Tomoro
            </span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[12px] tracking-[0.2em] font-sans">
            <button
              onClick={() => handleNavClick("#message")}
              className="text-[#cccccc] hover:text-white transition-colors uppercase py-1 relative group focus:outline-none"
            >
              MESSAGE
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </button>
            <button
              onClick={() => handleNavClick("#information")}
              className="text-[#cccccc] hover:text-white transition-colors uppercase py-1 relative group focus:outline-none"
            >
              INFORMATION
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-full" />
            </button>
            <button
              onClick={() => handleNavClick("#reply")}
              className="text-white hover:text-white px-4 py-1.5 rounded-full border border-[#555555] hover:border-white transition-colors uppercase text-[11.5px] tracking-[0.25em]"
            >
              YOUR REPLY
            </button>
          </nav>

          {/* Mobile / Full Menu Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-3.5 py-1.5 rounded-full border border-[#333333] hover:border-[#666666] text-[11.5px] tracking-[0.2em] uppercase font-sans text-[#cccccc] hover:text-white transition-all flex items-center gap-2 focus:outline-none"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
              <span>{menuOpen ? "CLOSE" : "MENU"}</span>
            </button>
          </div>
        </div>

        {/* Scroll Progress Hairline Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent overflow-hidden">
          <div
            className="h-full bg-white/40 origin-left transition-all duration-75"
            style={{ width: `${Math.min(100, Math.max(0, scrollProgress * 100))}%` }}
          />
        </div>
      </header>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-8 sm:p-16"
          >
            <div className="flex justify-between items-center max-w-7xl mx-auto w-full border-b border-[#333333] pb-6">
              <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#888888]">
                Wedding Ceremony • 2026.11.29
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-xs font-sans tracking-widest text-[#cccccc] hover:text-white uppercase flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>CLOSE</span>
              </button>
            </div>

            <div className="max-w-4xl mx-auto w-full my-auto py-12 space-y-8 text-center sm:text-left">
              <div>
                <button
                  onClick={() => handleNavClick("#message")}
                  className="font-mincho text-3xl sm:text-5xl text-[#cccccc] hover:text-white transition-colors tracking-widest block py-2"
                >
                  MESSAGE
                </button>
                <span className="text-xs text-[#777777] font-sans tracking-widest uppercase">
                  Greeting &amp; Vows
                </span>
              </div>

              <div>
                <button
                  onClick={() => handleNavClick("#theme")}
                  className="font-mincho text-3xl sm:text-5xl text-[#cccccc] hover:text-white transition-colors tracking-widest block py-2"
                >
                  THEME
                </button>
                <span className="text-xs text-[#777777] font-sans tracking-widest uppercase">
                  Good clothes Good meats Good Fortunes
                </span>
              </div>

              <div>
                <button
                  onClick={() => handleNavClick("#profile")}
                  className="font-mincho text-3xl sm:text-5xl text-[#cccccc] hover:text-white transition-colors tracking-widest block py-2"
                >
                  BRIDE &amp; GROOM
                </button>
                <span className="text-xs text-[#777777] font-sans tracking-widest uppercase">
                  Bride &amp; Groom Profile
                </span>
              </div>

              <div>
                <button
                  onClick={() => handleNavClick("#information")}
                  className="font-mincho text-3xl sm:text-5xl text-[#cccccc] hover:text-white transition-colors tracking-widest block py-2"
                >
                  INFORMATION
                </button>
                <span className="text-xs text-[#777777] font-sans tracking-widest uppercase">
                  Date, Venue &amp; Access
                </span>
              </div>

              <div>
                <button
                  onClick={() => handleNavClick("#reply")}
                  className="font-mincho text-3xl sm:text-5xl text-white hover:text-[#cccccc] transition-colors tracking-widest block py-2 underline decoration-[#555555] underline-offset-8"
                >
                  YOUR REPLY
                </button>
                <span className="text-xs text-[#aaaaaa] font-sans tracking-widest uppercase">
                  RSVP Response Form
                </span>
              </div>
            </div>

            <div className="max-w-7xl mx-auto w-full border-t border-[#333333] pt-6 flex flex-col sm:flex-row justify-between text-xs text-[#666666] font-sans tracking-wider">
              <span>Yuri Kunimatsu &amp; Tomoro Sugawara</span>
              <span>[@recipe mixture restaurant, Nagoya]</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
