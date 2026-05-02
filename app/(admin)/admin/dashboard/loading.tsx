import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Status Badge */}
      <div className="px-3 py-1 rounded-full border border-amber-300/70 dark:border-amber-900/50 bg-amber-100/60 dark:bg-amber-950/20 text-[10px] font-mono text-amber-600 dark:text-amber-500 tracking-tight uppercase inline-flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        [LOADING::ADMIN_PANEL]
      </div>

      {/* Title skeleton */}
      <div className="h-10 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />

      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
      </div>
    </div>
  );
}
