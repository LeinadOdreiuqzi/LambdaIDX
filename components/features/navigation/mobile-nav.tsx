"use client";

import React, { useEffect, useState } from "react";
import { Menu, X, Layers, Search, Moon, Sun, Monitor, Type, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NavTree } from "./nav-tree";
import { NavPage } from "@/types";
import { useNavigation } from "@/hooks/use-navigation";
import { cn } from "@/lib/utils";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { Logo } from "@/components/shared/logo";

interface MobileNavProps {
  tree: NavPage[];
}

type ThemeMode = "light" | "dark" | "system";
type FontSizeMode = "sm" | "md" | "lg";

const THEME_STORAGE_KEY = "lambdaidx-theme";
const FONT_SIZE_STORAGE_KEY = "lambdaidx-font-size";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDocument(mode: ThemeMode) {
  const html = document.documentElement;
  const actualTheme = mode === "system" ? getSystemTheme() : mode;
  html.dataset.theme = actualTheme;
  html.classList.toggle("dark", actualTheme === "dark");
}

function applyFontSizeToDocument(mode: FontSizeMode) {
  document.documentElement.dataset.fontSize = mode;
}

export function MobileNav({ tree }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [fontSize, setFontSize] = useState<FontSizeMode>("md");
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const { toggleCommandPalette } = useNavigation();
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY);

    const initialTheme: ThemeMode =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : "system";
    const initialFontSize: FontSizeMode =
      savedFontSize === "sm" || savedFontSize === "lg" ? savedFontSize : "md";

    setTheme(initialTheme);
    setFontSize(initialFontSize);
    applyThemeToDocument(initialTheme);
    applyFontSizeToDocument(initialFontSize);

    // Listen for system theme changes when in system mode
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyThemeToDocument("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyThemeToDocument(mode);
  };

  const handleFontSizeChange = (mode: FontSizeMode) => {
    setFontSize(mode);
    localStorage.setItem(FONT_SIZE_STORAGE_KEY, mode);
    applyFontSizeToDocument(mode);
  };

  return (
    <div className="md:hidden">
      {/* Basic Mobile Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
        <Logo size={24} />
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              ref={focusTrapRef}
              className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-black z-[100] p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo size={28} />
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    toggleCommandPalette();
                  }}
                  aria-label="Search knowledge"
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg w-full"
                >
                  <Search className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Search...</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar">
                 <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4">Knowledge Tree</h3>
                 <NavTree items={tree} />
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                <button
                  onClick={() => setIsAccessibilityOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400"
                  aria-expanded={isAccessibilityOpen}
                >
                  <span>Accessibility</span>
                  {isAccessibilityOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>

                {isAccessibilityOpen && (
                  <>
                    <div className="space-y-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Theme</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleThemeChange("light")}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                            theme === "light"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                          )}
                        >
                          <Sun className="h-3.5 w-3.5" />
                          <span>White</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("dark")}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                            theme === "dark"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                          )}
                        >
                          <Moon className="h-3.5 w-3.5" />
                          <span>Dark</span>
                        </button>
                        <button
                          onClick={() => handleThemeChange("system")}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs font-medium transition-colors",
                            theme === "system"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                          )}
                        >
                          <Monitor className="h-3.5 w-3.5" />
                          <span>System</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Font Size</p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleFontSizeChange("sm")}
                          className={cn(
                            "rounded-md border px-2 py-2 text-xs font-semibold transition-colors",
                            fontSize === "sm"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                          )}
                        >
                          A-
                        </button>
                        <button
                          onClick={() => handleFontSizeChange("md")}
                          className={cn(
                            "rounded-md border px-2 py-2 text-xs font-semibold transition-colors",
                            fontSize === "md"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                          )}
                        >
                          A
                        </button>
                        <button
                          onClick={() => handleFontSizeChange("lg")}
                          className={cn(
                            "rounded-md border px-2 py-2 text-xs font-semibold transition-colors",
                            fontSize === "lg"
                              ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                              : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                          )}
                        >
                          A+
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                        <Type className="h-3.5 w-3.5" />
                        Global text scaling
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
