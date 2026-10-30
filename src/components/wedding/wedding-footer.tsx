"use client";

import React from "react";
import { useLenis } from "@/components/providers/lenis-provider";

export function WeddingFooter() {
  const { scrollTo } = useLenis();

  const handleNavClick = (id: string) => {
    scrollTo(id, { offset: -70, duration: 1.3 });
  };

  return (
    <footer className="w-full bg-[#000000] border-t border-[#333333] py-20 px-6 sm:px-12 font-mincho text-[#cccccc]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <p className="font-mincho text-2xl sm:text-3xl tracking-[0.2em] text-white">
            Wedding Invitation
          </p>
          <p className="font-sans text-xs tracking-[0.3em] uppercase text-[#888888]">
            Yuri Kunimatsu &amp; Tomoro Sugawara Wedding Ceremony
          </p>
        </div>

        {/* Special Thanks Grid */}
        <div className="border-y border-[#222222] py-12">
          <h4 className="font-sans text-xs uppercase tracking-[0.3em] text-[#888888] text-center mb-8">
            Special Thanks
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-xs">
            <div className="space-y-1">
              <span className="font-sans text-[11px] text-[#777777] uppercase tracking-widest block">
                Photography
              </span>
              <span className="font-mincho text-white tracking-wider block text-sm">
                Hiroaki Tanooka
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-sans text-[11px] text-[#777777] uppercase tracking-widest block">
                Hair &amp; Makeup
              </span>
              <span className="font-mincho text-white tracking-wider block text-sm">
                Misato Akagi
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-sans text-[11px] text-[#777777] uppercase tracking-widest block">
                Styling
              </span>
              <span className="font-mincho text-white tracking-wider block text-sm">
                Chisaki Kaneda
              </span>
            </div>

            <div className="space-y-1">
              <span className="font-sans text-[11px] text-[#777777] uppercase tracking-widest block">
                Location
              </span>
              <span className="font-mincho text-white tracking-wider block text-sm leading-relaxed">
                Toyoda Auditorium, Nagoya University
              </span>
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-center items-center gap-8 font-sans text-xs tracking-[0.25em] uppercase text-[#888888]">
          <button
            onClick={() => handleNavClick("#message")}
            className="hover:text-white transition-colors"
          >
            MESSAGE
          </button>
          <span>•</span>
          <button
            onClick={() => handleNavClick("#information")}
            className="hover:text-white transition-colors"
          >
            INFORMATION
          </button>
          <span>•</span>
          <button
            onClick={() => handleNavClick("#reply")}
            className="hover:text-white transition-colors"
          >
            YOUR REPLY
          </button>
        </div>

        {/* Copyright */}
        <div className="text-center text-[11px] font-sans tracking-widest text-[#555555]">
          © All Rights Reserved. Sugawara
        </div>
      </div>
    </footer>
  );
}
