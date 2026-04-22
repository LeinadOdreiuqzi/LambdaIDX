"use client";

import React from "react";

export function IndustrialOverlay() {
  return (
    <>
      {/* Background Layer: Industrial Grid */}
      <div className="fixed inset-0 grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/10 dark:via-black/50 dark:to-black pointer-events-none z-0" />

      {/* Decorative Technical Overlays */}
      <div className="fixed top-8 left-8 hidden lg:flex flex-col gap-1 text-[10px] font-mono text-zinc-500 uppercase tracking-widest opacity-30 pointer-events-none z-50">
        <span>sys.v_0.1.0_alpha</span>
        <span>branch: master_main</span>
        <div className="mt-2 w-12 h-0.5 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="fixed top-8 right-8 hidden lg:flex items-center gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest opacity-30 pointer-events-none z-50">
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Node Cluster Online</span>
        </div>
        <span>UTC: {new Date().toISOString().split('T')[0]}</span>
      </div>
    </>
  );
}
