"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Traps keyboard focus within a container and restores focus on unmount.
 * Usage: const containerRef = useFocusTrap(isOpen);
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(active: boolean) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Save the element that had focus before the modal opened
  useEffect(() => {
    if (active) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [active]);

  // Restore focus when the modal closes
  useEffect(() => {
    if (!active && previousFocusRef.current) {
      const el = previousFocusRef.current;
      // Defer to let the DOM settle after AnimatePresence exit
      const id = requestAnimationFrame(() => {
        el.focus?.();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [active]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!active || !containerRef.current) return;

      if (e.key === "Tab") {
        const container = containerRef.current;
        const focusable = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [active]
  );

  useEffect(() => {
    if (active) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [active, handleKeyDown]);

  return containerRef;
}
