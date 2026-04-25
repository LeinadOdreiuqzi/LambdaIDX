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
        {/* Outer Tech Brackets - Enhanced Prominence */}
        <g className="opacity-50">
          <path
            d="M 28 12 L 12 12 L 12 88 L 28 88"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Detail Ticks */}
          <line x1="12" y1="50" x2="18" y2="50" stroke="currentColor" strokeWidth="1" />
        </g>
        <g className="opacity-50">
          <path
            d="M 72 12 L 88 12 L 88 88 L 72 88"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Detail Ticks */}
          <line x1="88" y1="50" x2="82" y2="50" stroke="currentColor" strokeWidth="1" />
        </g>

        {/* Central Geometric Diamond Frame - More Vistoso */}
        <path
          d="M 50 8 L 92 50 L 50 92 L 8 50 Z"
          stroke="currentColor"
          strokeWidth="1.5"
          className="opacity-40"
        />
        {/* Subtle Inner Diamond Glow/Detail */}
        <path
          d="M 50 15 L 85 50 L 50 85 L 15 50 Z"
          stroke="currentColor"
          strokeWidth="0.5"
          className="opacity-10"
        />

        {/* The Lambda 'λ' Core - Representing the Hierarchy/Branching */}
        <path
          d="M 50 20 V 55 L 25 80"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="square"
          className="opacity-100"
        />
        <path
          d="M 50 55 L 75 80"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="square"
          className="opacity-100"
        />

        {/* Knowledge Nodes - Representing the 5 Core Sciences at key intersections */}
        <circle cx="50" cy="20" r="2.5" fill="currentColor" /> {/* Root */}
        <circle cx="50" cy="55" r="2.5" fill="currentColor" /> {/* Junction */}
        <circle cx="25" cy="80" r="2" fill="currentColor" className="opacity-60" /> {/* Branch 1 */}
        <circle cx="75" cy="80" r="2" fill="currentColor" className="opacity-60" /> {/* Branch 2 */}
        <circle cx="50" cy="10" r="1.5" fill="currentColor" className="opacity-40" /> {/* Peak */}

        {/* Technical Coordinate Markers */}
        <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" className="opacity-20" />
        <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 3" className="opacity-20" />

        {/* Radar/Concentric Element (Scanning Knowledge) */}
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 6"
          className="opacity-20 animate-spin-slow"
          style={{ transformOrigin: 'center' }}
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-[0.2em] uppercase">
            Lambda<span className="opacity-50">IDX</span>
          </span>
          <span className="text-[7px] font-mono tracking-[0.4em] uppercase opacity-40 mt-0.5">
            Knowledge Archive.
          </span>
        </div>
      )}
    </div>
  );
}

// Add CSS for the slow spin in your global CSS or here if using a style tag
// .animate-spin-slow { animation: spin 20s linear infinite; }
