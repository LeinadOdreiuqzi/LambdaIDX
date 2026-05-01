"use client";

import { Toaster as Sonner } from "sonner";

export function TerminalToaster() {
  return (
    <Sonner
      theme="dark"
      className="toaster group font-mono text-sm"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-950 group-[.toaster]:text-zinc-300 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-lg group-[.toaster]:rounded-none group-[.toaster]:border-l-4 group-[.toaster]:border-l-zinc-500 uppercase tracking-wide",
          description: "group-[.toast]:text-zinc-500 normal-case tracking-normal",
          actionButton:
            "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-900 group-[.toast]:rounded-none group-[.toast]:text-xs uppercase",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400 group-[.toast]:rounded-none group-[.toast]:text-xs uppercase",
          success: "group-[.toaster]:border-l-green-500",
          error: "group-[.toaster]:border-l-red-500",
          warning: "group-[.toaster]:border-l-yellow-500",
          info: "group-[.toaster]:border-l-blue-500",
        },
      }}
    />
  );
}
