"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, CornerDownLeft, X, Loader2 } from "lucide-react";
import { useNavigation } from "@/hooks/use-navigation";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { StatusPage } from "@/components/shared/status-page";
import { NavPage } from "@/types";
import { cn } from "@/lib/utils";
import { buildPublicPageHref } from "@/lib/page-paths";

interface CommandPaletteProps {
  tree: NavPage[];
}

interface SearchPaletteItem {
  id: string;
  title: string;
  href: string;
  excerpt?: string | null;
  source?: "database" | "meilisearch" | "tree";
}

export function CommandPalette({ tree }: CommandPaletteProps) {
  const router = useRouter();
  const { isCommandPaletteOpen, setIsCommandPaletteOpen, toggleCommandPalette } = useNavigation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [searchResults, setSearchResults] = useState<SearchPaletteItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const focusTrapRef = useFocusTrap<HTMLDivElement>(isCommandPaletteOpen);

  // Flatten the tree for default quick links and fallback
  const flatPages = useMemo(() => {
    const flatten = (
      items: NavPage[],
      slugTrail: string[] = []
    ): Array<Omit<NavPage, "children"> & { href: string }> => {
      return items.reduce((acc, item) => {
        const { children, ...rest } = item;
        const nextSlugTrail = [...slugTrail, item.slug];

        return [
          ...acc,
          {
            ...rest,
            href: buildPublicPageHref(nextSlugTrail),
          },
          ...flatten(children, nextSlugTrail),
        ];
      }, [] as Array<Omit<NavPage, "children"> & { href: string }>);
    };
    return flatten(tree);
  }, [tree]);

  // Debounced API search query against /api/search (PostgreSQL FTS + Meilisearch)
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    setIsSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=8`);
        if (res.ok && isMounted) {
          const data: {
            hits: Array<{ id: string; title: string; slug: string; path: string; excerpt?: string | null }>;
            source?: "meilisearch" | "database";
          } = await res.json();

          if (data && Array.isArray(data.hits)) {
            const hits: SearchPaletteItem[] = data.hits.map((hit) => {
              const fullHref = hit.path?.startsWith("/index/")
                ? hit.path
                : `/index/${hit.slug}`;

              return {
                id: hit.id,
                title: hit.title,
                href: fullHref,
                excerpt: hit.excerpt,
                source: data.source || "database",
              };
            });

            setSearchResults(hits);
            setIsSearching(false);
            return;
          }
        }
      } catch (err) {
        console.warn("API search failed, falling back to in-memory tree filter:", err);
      }

      // Graceful local fallback to tree nodes if API fails
      if (isMounted) {
        const localMatches: SearchPaletteItem[] = flatPages
          .filter((page) => page.title.toLowerCase().includes(trimmed.toLowerCase()))
          .slice(0, 8)
          .map((page) => ({
            id: page.id,
            title: page.title,
            href: page.href,
            source: "tree",
          }));

        setSearchResults(localMatches);
        setIsSearching(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query, flatPages]);

  // Displayed items: quick nodes when query is empty, otherwise full-text search results
  const displayedItems: SearchPaletteItem[] = useMemo(() => {
    if (!query.trim()) {
      return flatPages.slice(0, 5).map((page) => ({
        id: page.id,
        title: page.title,
        href: page.href,
        excerpt: null,
        source: "tree" as const,
      }));
    }
    return searchResults;
  }, [query, flatPages, searchResults]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [displayedItems]);

  // Handle keyboard shortcuts
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

  const handleSelect = (item: SearchPaletteItem) => {
    router.push(item.href);
    setIsCommandPaletteOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (displayedItems.length === 0) return;
      setSelectedIndex((prev) => (prev + 1) % displayedItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (displayedItems.length === 0) return;
      setSelectedIndex((prev) => (prev - 1 + displayedItems.length) % displayedItems.length);
    } else if (e.key === "Enter") {
      if (displayedItems[selectedIndex]) {
        handleSelect(displayedItems[selectedIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div ref={focusTrapRef} className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] px-4">
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
                placeholder="Buscar por título, contenido o conceptos..."
                className={cn(
                  "flex-1 bg-transparent border-none outline-none font-mono text-sm",
                  theme === "light"
                    ? "text-slate-700 placeholder:text-slate-400"
                    : "text-zinc-100 placeholder:text-zinc-600"
                )}
              />
              {isSearching && (
                <Loader2 className={cn("w-4 h-4 animate-spin", theme === "light" ? "text-slate-400" : "text-zinc-500")} />
              )}
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
              {displayedItems.length > 0 ? (
                <div className="px-2 space-y-1">
                  <div
                    className={cn(
                      "px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between",
                      theme === "light" ? "text-slate-500" : "text-zinc-600"
                    )}
                  >
                    <span>
                      {query.trim()
                        ? isSearching
                          ? "Buscando en archivo..."
                          : `Resultados (${displayedItems.length})`
                        : "Nodos Recientes"}
                    </span>
                    {query.trim() && !isSearching && (
                      <span className="font-mono text-[9px] lowercase opacity-60">full-text index</span>
                    )}
                  </div>
                  {displayedItems.map((item, index) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                        index === selectedIndex
                          ? theme === "light"
                            ? "bg-slate-200 text-slate-800"
                            : "bg-zinc-900 text-white"
                          : theme === "light"
                            ? "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40"
                      )}
                    >
                      <FileText
                        className={cn(
                          "w-4 h-4 shrink-0 mt-0.5",
                          index === selectedIndex
                            ? theme === "light"
                              ? "text-slate-800"
                              : "text-white"
                            : theme === "light"
                              ? "text-slate-400"
                              : "text-zinc-600"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="truncate text-sm font-medium">{item.title}</div>
                        {item.excerpt && (
                          <div
                            className={cn(
                              "text-xs truncate mt-0.5 line-clamp-1 opacity-70",
                              theme === "light" ? "text-slate-600" : "text-zinc-400"
                            )}
                          >
                            {item.excerpt}
                          </div>
                        )}
                      </div>
                      {item.source && item.source !== "tree" && (
                        <span
                          className={cn(
                            "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 mt-0.5",
                            theme === "light"
                              ? "bg-slate-100 border-slate-300 text-slate-600"
                              : "bg-zinc-900 border-zinc-800 text-zinc-500"
                          )}
                        >
                          {item.source}
                        </span>
                      )}
                      {index === selectedIndex && (
                        <div
                          className={cn(
                            "flex items-center gap-1 text-[10px] font-mono shrink-0 mt-0.5",
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
              ) : !isSearching ? (
                <StatusPage
                  variant="empty"
                  compact
                  icon={<X className={cn("w-6 h-6", theme === "light" ? "text-slate-400" : "text-zinc-700")} />}
                  badge="EMPTY"
                  heading={null}
                  description={`No se encontraron nodos coincidentes para "${query}"`}
                />
              ) : (
                <div className="flex items-center justify-center py-12 gap-3 text-zinc-500 font-mono text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Explorando archivo de conocimiento...</span>
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
                <span>Navegar</span>
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
                <span>Abrir</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
