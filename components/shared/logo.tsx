"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function Logo({ className, size = 32, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Rasputin-inspired Isotype */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-current"
      >
        {/* Outer Tech Brackets */}
        <path
          d="M 20 10 L 10 10 L 10 90 L 20 90"
          stroke="currentColor"
          strokeWidth="1.5"
          className="opacity-40"
        />
        <path
          d="M 80 10 L 90 10 L 90 90 L 80 90"
          stroke="currentColor"
          strokeWidth="1.5"
          className="opacity-40"
        />

        {/* Central Geometric Core (Warmind style) */}
        {/* Top Triangle */}
        <path
          d="M 50 15 L 80 45 L 20 45 Z"
          fill="currentColor"
          className="opacity-90"
        />

        {/* Bottom Left Fragment (Suggesting Lambda leg) */}
        <path
          d="M 18 50 L 48 50 L 18 80 Z"
          fill="currentColor"
          className="opacity-100"
        />

        {/* Bottom Right Fragment */}
        <path
          d="M 52 50 L 82 50 L 82 80 Z"
          fill="currentColor"
          className="opacity-70"
        />

      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-[0.2em] uppercase">
            Lambda<span className="opacity-50">IDX</span>
          </span>
          <span className="text-[7px] font-mono tracking-[0.4em] uppercase opacity-40 mt-0.5">
            knowledge Archive.
          </span>
        </div>
      )}
    </div>
  );
}

// Add CSS for the slow spin in your global CSS or here if using a style tag
// .animate-spin-slow { animation: spin 20s linear infinite; }
