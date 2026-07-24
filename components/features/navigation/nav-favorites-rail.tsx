"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book,
  Brain,
  Atom,
  Code,
  GraduationCap,
  Folder,
  Sparkles,
  Bookmark,
  Plus,
  Star,
  Search,
  ChevronRight,
  FileText,
  X,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteFolder, FavoriteItem, PresetColor, PresetIcon } from "@/types/favorites";

const COLOR_MAP: Record<PresetColor, { bg: string; text: string; ring: string; border: string }> = {
  indigo: {
    bg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    text: "text-indigo-500",
    ring: "ring-indigo-500",
    border: "border-indigo-500/30",
  },
  violet: {
    bg: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    text: "text-violet-500",
    ring: "ring-violet-500",
    border: "border-violet-500/30",
  },
  emerald: {
    bg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    text: "text-emerald-500",
    ring: "ring-emerald-500",
    border: "border-emerald-500/30",
  },
  amber: {
    bg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    text: "text-amber-500",
    ring: "ring-amber-500",
    border: "border-amber-500/30",
  },
  rose: {
    bg: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
    text: "text-rose-500",
    ring: "ring-rose-500",
    border: "border-rose-500/30",
  },
  cyan: {
    bg: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
    text: "text-cyan-500",
    ring: "ring-cyan-500",
    border: "border-cyan-500/30",
  },
  sky: {
    bg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
    text: "text-sky-500",
    ring: "ring-sky-500",
    border: "border-sky-500/30",
  },
  zinc: {
    bg: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400",
    text: "text-zinc-500",
    ring: "ring-zinc-500",
    border: "border-zinc-500/30",
  },
};

export function getFolderIconComponent(iconName?: string) {
  switch (iconName) {
    case "book":
      return Book;
    case "brain":
      return Brain;
    case "atom":
      return Atom;
    case "code":
      return Code;
    case "graduation-cap":
      return GraduationCap;
    case "sparkles":
      return Sparkles;
    case "bookmark":
      return Bookmark;
    case "folder":
    default:
      return Folder;
  }
}

interface NavFavoritesRailProps {
  onOpenFolderModal?: () => void;
  onContextMenuFolder?: (e: React.MouseEvent, folder: FavoriteFolder) => void;
  onContextMenuFavItem?: (e: React.MouseEvent, item: FavoriteItem) => void;
  onContextMenuRailCanvas?: (e: React.MouseEvent) => void;
}

export function NavFavoritesRail({
  onOpenFolderModal,
  onContextMenuFolder,
  onContextMenuFavItem,
  onContextMenuRailCanvas,
}: NavFavoritesRailProps) {
  const pathname = usePathname();
  const {
    folders,
    items,
    activeFolderId,
    setActiveFolderId,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  } = useFavorites();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isCurrentPinned = isFavorite(pathname);

  // Filter items based on activeFolderId and search
  const filteredItems = items.filter((item: FavoriteItem) => {
    const matchesFolder =
      activeFolderId === null
        ? true
        : activeFolderId === "unsorted"
        ? !item.folderId
        : item.folderId === activeFolderId;
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFolder && matchesSearch;
  });

  const activeFolder = folders.find((f: FavoriteFolder) => f.id === activeFolderId);

  const handleFolderClick = (folderId: string | null) => {
    if (activeFolderId === folderId && isDrawerOpen) {
      setIsDrawerOpen(false);
    } else {
      setActiveFolderId(folderId);
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="relative flex z-30 select-none">
      {/* Discord-style Vertical Server Rail */}
      <aside
        onContextMenu={(e) => {
          if (onContextMenuRailCanvas) {
            e.preventDefault();
            onContextMenuRailCanvas(e);
          }
        }}
        className="hidden md:flex flex-col items-center py-3 w-16 h-screen sticky top-0 bg-zinc-100 dark:bg-[#0c0d0e] border-r border-zinc-200 dark:border-zinc-850 shrink-0 space-y-2 overflow-y-auto custom-scrollbar"
      >
        {/* Main Workspace/Favorites Logo Button */}
        <div className="relative group flex items-center justify-center w-full">
          {/* Discord pill indicator */}
          <div
            className={cn(
              "absolute left-0 w-1 bg-black dark:bg-white rounded-r-full transition-all duration-200",
              isDrawerOpen && activeFolderId === null ? "h-10 opacity-100" : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"
            )}
          />
          <button
            onClick={() => handleFolderClick(null)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs",
              isDrawerOpen && activeFolderId === null
                ? "bg-indigo-600 text-white rounded-xl"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 hover:rounded-xl border border-zinc-200 dark:border-zinc-800"
            )}
            title="Todos los Favoritos"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-8 h-px bg-zinc-300 dark:bg-zinc-800 my-1" />

        {/* List of Custom Folders */}
        <div className="flex-1 w-full flex flex-col items-center space-y-2.5">
          {folders.map((folder: FavoriteFolder) => {
            const IconComp = getFolderIconComponent(folder.icon);
            const colorTheme = COLOR_MAP[(folder.color as PresetColor) || "indigo"];
            const folderItemCount = items.filter((i: FavoriteItem) => i.folderId === folder.id).length;
            const isActive = isDrawerOpen && activeFolderId === folder.id;

            return (
              <div
                key={folder.id}
                className="relative group flex items-center justify-center w-full"
                onContextMenu={(e) => {
                  if (onContextMenuFolder) {
                    e.preventDefault();
                    e.stopPropagation();
                    onContextMenuFolder(e, folder);
                  }
                }}
              >
                {/* Discord Left Pill */}
                <div
                  className={cn(
                    "absolute left-0 w-1 bg-black dark:bg-white rounded-r-full transition-all duration-200",
                    isActive ? "h-10 opacity-100" : "h-0 opacity-0 group-hover:h-5 group-hover:opacity-100"
                  )}
                />

                <button
                  onClick={() => handleFolderClick(folder.id)}
                  className={cn(
                    "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer border shadow-xs",
                    isActive
                      ? "rounded-xl ring-2 ring-indigo-500 " + colorTheme.bg
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:rounded-xl border-zinc-200 dark:border-zinc-800 hover:" + colorTheme.bg
                  )}
                  title={`${folder.name} (${folderItemCount} páginas)`}
                >
                  <IconComp className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", colorTheme.text)} />

                  {/* Item count badge */}
                  {folderItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                      {folderItemCount}
                    </span>
                  )}
                </button>
              </div>
            );
          })}

          {/* Add Folder (+) Button */}
          <div className="relative group flex items-center justify-center w-full pt-1">
            <button
              onClick={onOpenFolderModal}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400 hover:text-indigo-500 hover:border-indigo-500 hover:rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
              title="Nueva carpeta de estudio"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Pin Button */}
        <div className="w-full flex flex-col items-center pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => {
              const currentTitle = document.title || pathname;
              const slug = pathname.split("/").filter(Boolean).pop() || "";
              toggleFavorite({ title: currentTitle, path: pathname, slug });
            }}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer border shadow-xs",
              isCurrentPinned
                ? "bg-amber-500/20 text-amber-500 border-amber-500/40 rounded-xl"
                : "bg-white dark:bg-zinc-900 text-zinc-400 hover:text-amber-500 border-zinc-200 dark:border-zinc-800 hover:rounded-xl"
            )}
            title={isCurrentPinned ? "Página actual fijada en favoritos" : "Fijar página actual"}
          >
            <Star className={cn("w-5 h-5", isCurrentPinned && "fill-amber-500")} />
          </button>
        </div>
      </aside>

      {/* Floating Study Drawer (Panel Desplegable de Estudio) */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-20 shadow-xl overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {activeFolder ? (
                  <>
                    <div className={cn("p-1.5 rounded-lg border", COLOR_MAP[(activeFolder.color as PresetColor) || "indigo"].bg)}>
                      {React.createElement(getFolderIconComponent(activeFolder.icon), { className: "w-4 h-4" })}
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {activeFolder.name}
                    </h3>
                  </>
                ) : (
                  <>
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      Todos los Favoritos
                    </h3>
                  </>
                )}
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Search */}
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-900">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar en favoritos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Saved Pages List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <FileText className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                  <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Sin favoritos aún</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                    Guarda páginas de estudio con la estrella en la cabecera del artículo.
                  </p>
                </div>
              ) : (
                filteredItems.map((item: FavoriteItem) => {
                  const isActivePath = pathname === item.path;

                  return (
                    <div
                      key={item.id}
                      onContextMenu={(e) => {
                        if (onContextMenuFavItem) {
                          e.preventDefault();
                          e.stopPropagation();
                          onContextMenuFavItem(e, item);
                        }
                      }}
                      className={cn(
                        "group relative rounded-xl border p-2.5 transition-all hover:shadow-xs",
                        isActivePath
                          ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50"
                          : "bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      <Link href={item.path} className="block group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.title}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[10px] font-mono text-zinc-400 mt-0.5 truncate">{item.path}</p>

                        {/* Research Note preview */}
                        {item.note && (
                          <div className="mt-2 flex items-center gap-1.5 text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 p-1.5 rounded-md border border-amber-500/20">
                            <StickyNote className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="truncate italic">{item.note}</span>
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
