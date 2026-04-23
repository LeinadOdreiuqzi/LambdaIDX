"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, CornerDownLeft, Command, X } from "lucide-react";
import { useNavigation } from "@/hooks/use-navigation";
import { NavPage } from "@/types";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  tree: NavPage[];
}

export function CommandPalette({ tree }: CommandPaletteProps) {
  const router = useRouter();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, toggleCommandPalette } = useNavigation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten the tree for searching
  const flatPages = useMemo(() => {
    const flatten = (items: NavPage[]): Omit<NavPage, 'children'>[] => {
      return items.reduce((acc, item) => {
        const { children, ...rest } = item;
        return [...acc, rest, ...flatten(children)];
      }, [] as Omit<NavPage, 'children'>[]);
    };
    return flatten(tree);
  }, [tree]);

  // Filter based on query
  const filteredPages = useMemo(() => {
    if (!query) return flatPages.slice(0, 5); // Show first 5 by default
    return flatPages.filter((page) =>
      page.title.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  }, [flatPages, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggleCommandPalette();
      }
      if (e.key === "Escape") {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCommandPalette, setIsCommandPaletteOpen]);

  // Focus input on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      document.body.style.overflow = "hidden";
    } else {
      setQuery("");
      document.body.style.overflow = "auto";
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    const html = document.documentElement;
    const syncTheme = () => {
      const nextTheme = html.dataset.theme === "light" ? "light" : "dark";
      setTheme(nextTheme);
    };

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  const handleSelect = (page: Omit<NavPage, 'children'>) => {
    router.push(`/p/${page.slug}`);
    setIsCommandPaletteOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredPages.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredPages.length) % filteredPages.length);
    } else if (e.key === "Enter") {
      if (filteredPages[selectedIndex]) {
        handleSelect(filteredPages[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCommandPaletteOpen(false)}
            className={cn(
              "fixed inset-0 backdrop-blur-sm",
              theme === "light" ? "bg-slate-950/20" : "bg-black/60"
            )}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden",
              theme === "light"
                ? "bg-[#f8fafc] border border-slate-200"
                : "bg-zinc-950 border border-zinc-800"
            )}
          >
            {/* Search Input */}
            <div
              className={cn(
                "flex items-center gap-3 px-4 h-14 border-b",
                theme === "light" ? "border-slate-200" : "border-zinc-800"
              )}
            >
              <Search className={cn("w-5 h-5", theme === "light" ? "text-slate-500" : "text-zinc-500")} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search knowledge tree..."
                className={cn(
                  "flex-1 bg-transparent border-none outline-none font-mono text-sm",
                  theme === "light"
                    ? "text-slate-700 placeholder:text-slate-400"
                    : "text-zinc-100 placeholder:text-zinc-600"
                )}
              />
              <div
                className={cn(
                  "flex items-center gap-1.5 px-1.5 py-1 border rounded text-[10px] font-mono",
                  theme === "light"
                    ? "bg-slate-100 border-slate-200 text-slate-500"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500"
                )}
              >
                <kbd>ESC</kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar py-2">
              {filteredPages.length > 0 ? (
                <div className="px-2 space-y-1">
                  <div
                    className={cn(
                      "px-3 py-2 text-[10px] font-bold uppercase tracking-widest",
                      theme === "light" ? "text-slate-500" : "text-zinc-600"
                    )}
                  >
                    {query ? "Search Results" : "Recent Knowledge Nodes"}
                  </div>
                  {filteredPages.map((page, index) => (
                    <div
                      key={page.id}
                      onClick={() => handleSelect(page)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all",
                        index === selectedIndex 
                          ? theme === "light"
                            ? "bg-slate-200 text-slate-800"
                            : "bg-zinc-900 text-white"
                          : theme === "light"
                            ? "text-slate-500 hover:text-slate-700"
                            : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <FileText className={cn(
                        "w-4 h-4",
                        index === selectedIndex
                          ? theme === "light"
                            ? "text-slate-800"
                            : "text-white"
                          : theme === "light"
                            ? "text-slate-400"
                            : "text-zinc-600"
                      )} />
                      <div className="flex-1 truncate text-sm font-medium">
                        {page.title}
                      </div>
                      {index === selectedIndex && (
                        <div
                          className={cn(
                            "flex items-center gap-1 text-[10px] font-mono",
                            theme === "light" ? "text-slate-500" : "text-zinc-500"
                          )}
                        >
                          <span>Select</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className={cn(
                      "w-12 h-12 border rounded-xl flex items-center justify-center mb-4",
                      theme === "light" ? "bg-slate-100 border-slate-200" : "bg-zinc-900 border-zinc-800"
                    )}
                  >
                    <X className={cn("w-6 h-6", theme === "light" ? "text-slate-400" : "text-zinc-700")} />
                  </div>
                  <p className={cn("text-sm", theme === "light" ? "text-slate-500" : "text-zinc-500")}>
                    No nodes found matching "{query}"
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className={cn(
                "px-4 py-3 border-t flex items-center gap-6",
                theme === "light" ? "bg-slate-100/80 border-slate-200" : "bg-zinc-900/50 border-zinc-800"
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-tight",
                  theme === "light" ? "text-slate-500" : "text-zinc-500"
                )}
              >
                <span className={cn("p-1 border rounded", theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800")}>
                   ↑↓
                </span>
                <span>Navigate</span>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-tight",
                  theme === "light" ? "text-slate-500" : "text-zinc-500"
                )}
              >
                <span className={cn("p-1 border rounded", theme === "light" ? "bg-slate-50 border-slate-200" : "bg-zinc-950 border-zinc-800")}>
                   Enter
                </span>
                <span>Open</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
