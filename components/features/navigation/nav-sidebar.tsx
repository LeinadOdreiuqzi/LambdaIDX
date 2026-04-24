"use client";

import React, { useEffect, useState } from "react";
import { Search, PanelLeftClose, Layers, Moon, Sun, Type, ChevronUp, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/hooks/use-navigation";
import { NavTree } from "./nav-tree";
import { NavPage } from "@/types";
import { Logo } from "@/components/shared/logo";

interface NavSidebarProps {
  tree: NavPage[];
}

type ThemeMode = "light" | "dark";
type FontSizeMode = "sm" | "md" | "lg";

const THEME_STORAGE_KEY = "lambdaidx-theme";
const FONT_SIZE_STORAGE_KEY = "lambdaidx-font-size";

function applyThemeToDocument(mode: ThemeMode) {
  const html = document.documentElement;
  html.dataset.theme = mode;
  html.classList.toggle("dark", mode === "dark");
}

function applyFontSizeToDocument(mode: FontSizeMode) {
  document.documentElement.dataset.fontSize = mode;
}

export function NavSidebar({ tree }: NavSidebarProps) {
  const { isSidebarOpen, toggleSidebar, toggleCommandPalette } = useNavigation();
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [fontSize, setFontSize] = useState<FontSizeMode>("md");
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const savedFontSize = localStorage.getItem(FONT_SIZE_STORAGE_KEY);

    const initialTheme: ThemeMode = savedTheme === "light" ? "light" : "dark";
    const initialFontSize: FontSizeMode =
      savedFontSize === "sm" || savedFontSize === "lg" ? savedFontSize : "md";

    setTheme(initialTheme);
    setFontSize(initialFontSize);
    applyThemeToDocument(initialTheme);
    applyFontSizeToDocument(initialFontSize);
  }, []);

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
    <motion.aside
      initial={false}
      animate={{ 
        width: isSidebarOpen ? 280 : 0, 
        opacity: isSidebarOpen ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex flex-col sticky top-0 h-screen bg-white border-r border-zinc-200 dark:bg-black dark:border-zinc-800 overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full w-[280px]">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-transparent">
          <Logo size={28} />
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <PanelLeftClose className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Search Bar Placeholder */}
        <div className="px-4 py-4">
          <button
            type="button"
            onClick={toggleCommandPalette}
            aria-label="Search knowledge"
            className={cn(
              "flex items-center gap-2 px-3 py-2 border rounded-lg group cursor-pointer transition-colors w-full",
              theme === "light"
                ? "bg-[#eef2f7] border-slate-200 hover:border-slate-300"
                : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
            )}
          >
            <Search className={cn("w-4 h-4 transition-colors", theme === "light" ? "text-slate-500" : "text-zinc-400")} />
            <span
              className={cn(
                "text-sm transition-colors",
                theme === "light"
                  ? "text-slate-500 group-hover:text-slate-700"
                  : "text-zinc-400 group-hover:text-zinc-300"
              )}
            >
              Search knowledge...
            </span>
            <span
              className={cn(
                "ml-auto text-[10px] px-1 rounded font-mono transition-colors",
                theme === "light"
                  ? "text-slate-500 border border-slate-200"
                  : "text-zinc-400 border border-zinc-800"
              )}
            >
              ⌘K
            </span>
          </button>
        </div>

        {/* Navigation Tree */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Knowledge Tree</h3>
            <NavTree items={tree} />
          </div>
        </div>

        {/* Accessibility Settings */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
          <div className="px-2">
            <button
              onClick={() => setIsAccessibilityOpen((prev) => !prev)}
              className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              aria-expanded={isAccessibilityOpen}
            >
              <span>Accessibility</span>
              {isAccessibilityOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronUp className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {isAccessibilityOpen && (
            <>
              <div className="space-y-2">
                <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Theme</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleThemeChange("light")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                      theme === "light"
                        ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                    )}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    White
                  </button>
                  <button
                    onClick={() => handleThemeChange("dark")}
                    className={cn(
                      "flex items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
                      theme === "dark"
                        ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                    )}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="px-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">Font Size</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleFontSizeChange("sm")}
                    className={cn(
                      "rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
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
                      "rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
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
                      "rounded-md border px-2 py-1.5 text-xs font-semibold transition-colors",
                      fontSize === "lg"
                        ? "border-zinc-400 bg-zinc-100 text-zinc-700 dark:border-zinc-500 dark:bg-zinc-800 dark:text-zinc-200"
                        : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400 dark:hover:border-zinc-700"
                    )}
                  >
                    A+
                  </button>
                </div>
                <div className="flex items-center gap-1.5 px-2 text-[10px] text-zinc-400">
                  <Type className="h-3.5 w-3.5" />
                  Global text scaling
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
