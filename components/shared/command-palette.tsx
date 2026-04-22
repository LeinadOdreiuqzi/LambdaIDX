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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 h-14 border-b border-zinc-800">
              <Search className="w-5 h-5 text-zinc-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search knowledge tree..."
                className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 font-mono text-sm"
              />
              <div className="flex items-center gap-1.5 px-1.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-500">
                <kbd>ESC</kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto no-scrollbar py-2">
              {filteredPages.length > 0 ? (
                <div className="px-2 space-y-1">
                  <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
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
                          ? "bg-zinc-900 text-white" 
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      <FileText className={cn(
                        "w-4 h-4",
                        index === selectedIndex ? "text-white" : "text-zinc-600"
                      )} />
                      <div className="flex-1 truncate text-sm font-medium">
                        {page.title}
                      </div>
                      {index === selectedIndex && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                          <span>Select</span>
                          <CornerDownLeft className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center mb-4">
                    <X className="w-6 h-6 text-zinc-700" />
                  </div>
                  <p className="text-sm text-zinc-500">No nodes found matching "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-zinc-900/50 border-t border-zinc-800 flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-tight">
                <span className="p-1 bg-zinc-950 border border-zinc-800 rounded">
                   ↑↓
                </span>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-tight">
                <span className="p-1 bg-zinc-950 border border-zinc-800 rounded">
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
