"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ============================================================
// STATUS PAGE — Unified pattern for all status states
// Layout: Icon → Badge → Heading → Description → Action
// ============================================================

type StatusVariant = "error" | "empty" | "loading" | "not-found";

interface StatusPageProps {
  /** Visual variant — controls badge color and default tone */
  variant: StatusVariant;
  /** Icon element (rendered inside a rounded container) */
  icon: React.ReactNode;
  /** Short code displayed in the badge (e.g. "ERROR::404", "EMPTY", "LOADING") */
  badge: string;
  /** Main heading — large, dramatic, uppercase */
  heading: React.ReactNode;
  /** Supporting description */
  description: string;
  /** Optional CTA link */
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  /** Additional class for the outer container */
  className?: string;
  /** Compact mode — used inside panels/drawers instead of full-page */
  compact?: boolean;
}

const variantStyles: Record<StatusVariant, { badge: string; badgeText: string }> = {
  error: {
    badge: "border-red-300/70 dark:border-red-900/50 bg-red-100/60 dark:bg-red-950/20",
    badgeText: "text-red-600 dark:text-red-500",
  },
  "not-found": {
    badge: "border-red-300/70 dark:border-red-900/50 bg-red-100/60 dark:bg-red-950/20",
    badgeText: "text-red-600 dark:text-red-500",
  },
  empty: {
    badge: "border-zinc-300/70 dark:border-zinc-700/50 bg-zinc-100/60 dark:bg-zinc-800/30",
    badgeText: "text-zinc-500 dark:text-zinc-400",
  },
  loading: {
    badge: "border-amber-300/70 dark:border-amber-900/50 bg-amber-100/60 dark:bg-amber-950/20",
    badgeText: "text-amber-600 dark:text-amber-500",
  },
};

export function StatusPage({
  variant,
  icon,
  badge,
  heading,
  description,
  action,
  className,
  compact = false,
}: StatusPageProps) {
  const styles = variantStyles[variant];

  if (compact) {
    return (
      <div className={cn("flex flex-col items-center text-center py-12 px-4", className)}>
        <div className={cn(
          "mb-4 p-3 border rounded-xl",
          variant === "error" || variant === "not-found"
            ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
        )}>
          {icon}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">{description}</p>
        {action && (
          <Link
            href={action.href}
            className="mt-4 text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
          >
            {action.icon}
            {action.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--foreground)] selection:text-[var(--background)] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Layer */}
      <div className="fixed inset-0 grid-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
        {/* Icon */}
        <div className={cn(
          "mb-8 p-4 border rounded-2xl",
          variant === "error" || variant === "not-found"
            ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
        )}>
          {icon}
        </div>

        {/* Badge */}
        <div className={cn(
          "px-3 py-1 rounded-full border text-[10px] font-mono tracking-tight uppercase mb-6",
          styles.badge,
          styles.badgeText
        )}>
          [{badge}]
        </div>

        {/* Heading */}
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
          {heading}
        </h1>

        {/* Description */}
        <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-12 leading-relaxed">
          {description}
        </p>

        {/* Action */}
        {action && (
          <Link
            href={action.href}
            className="group flex items-center gap-3 px-8 py-4 bg-zinc-900 text-zinc-100 dark:bg-white dark:text-black font-black uppercase tracking-widest text-xs transition-all hover:pr-10"
          >
            {action.icon && (
              <span className="transition-transform group-hover:-translate-x-1">
                {action.icon}
              </span>
            )}
            <span>{action.label}</span>
          </Link>
        )}
      </div>

      {/* Decorative Footer Overlays */}
      <div className="absolute bottom-8 left-8 text-[10px] font-mono text-zinc-500 dark:text-zinc-700 uppercase tracking-widest">
        <span>Status: {variant === "loading" ? "Processing" : variant === "error" ? "Error" : variant === "not-found" ? "Disconnected" : "Empty"}</span>
      </div>
      <div className="absolute bottom-8 right-8 text-[10px] font-mono text-zinc-500 dark:text-zinc-700 uppercase tracking-widest">
        <span>Lambda_OS_v1.0.0</span>
      </div>
    </div>
  );
}
