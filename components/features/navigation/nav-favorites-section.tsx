"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Bookmark,
  Sparkles,
  FileText,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteFolder, FavoriteItem, PresetColor } from "@/types/favorites";
import { getFolderIconComponent } from "./nav-favorites-rail";

const COLOR_BADGE_MAP: Record<PresetColor, string> = {
  indigo: "bg-indigo-500",
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  cyan: "bg-cyan-500",
  sky: "bg-sky-500",
  zinc: "bg-zinc-500",
};

interface NavFavoritesSectionProps {
  onOpenFolderModal: (folder?: FavoriteFolder) => void;
  onOpenNoteModal: (itemId: string, currentTitle: string, currentNote?: string) => void;
  onContextMenuFolder: (e: React.MouseEvent, folder: FavoriteFolder) => void;
  onContextMenuFavItem: (e: React.MouseEvent, item: FavoriteItem) => void;
}

export function NavFavoritesSection({
  onOpenFolderModal,
  onOpenNoteModal,
  onContextMenuFolder,
  onContextMenuFavItem,
}: NavFavoritesSectionProps) {
  const pathname = usePathname();
  const { folders, items } = useFavorites();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true, // Root items expanded by default
  });

  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Group items by folder
  const rootItems = items.filter((item) => !item.folderId);

  return (
    <div className="mb-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          <Bookmark className="w-3 h-3 text-zinc-400" />
          <span>Study Workspace</span>
        </div>
        <button
          onClick={() => onOpenFolderModal()}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          title="Nueva carpeta de estudio"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Folders & Items Tree */}
      <div className="space-y-0.5">
        {/* Custom Folders */}
        {folders.map((folder) => {
          const isExpanded = !!expandedFolders[folder.id];
          const folderItems = items.filter((i) => i.folderId === folder.id);
          const IconComp = getFolderIconComponent(folder.icon);
          const badgeColor = COLOR_BADGE_MAP[(folder.color as PresetColor) || "indigo"];

          return (
            <div key={folder.id} className="space-y-0.5">
              {/* Folder Row */}
              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  onContextMenuFolder(e, folder);
                }}
                onClick={() => toggleFolderExpand(folder.id)}
                className="group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="p-0.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="relative flex items-center gap-1.5">
                    <IconComp className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="truncate">{folder.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={cn("w-1.5 h-1.5 rounded-full", badgeColor)} />
                  <span className="text-[10px] font-mono text-zinc-400">{folderItems.length}</span>
                </div>
              </div>

              {/* Folder Nested Items */}
              {isExpanded && (
                <div className="pl-6 space-y-0.5 border-l border-zinc-100 dark:border-zinc-850 ml-3.5 my-0.5">
                  {folderItems.length === 0 ? (
                    <div className="py-1 px-2 text-[11px] text-zinc-400 italic">Carpeta vacía</div>
                  ) : (
                    folderItems.map((item) => {
                      const isActive = pathname === item.path;

                      return (
                        <div
                          key={item.id}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onContextMenuFavItem(e, item);
                          }}
                          className={cn(
                            "group flex flex-col px-2 py-1 rounded-md text-xs transition-colors",
                            isActive
                              ? "bg-zinc-100 dark:bg-zinc-850 font-semibold text-zinc-900 dark:text-white"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                          )}
                        >
                          <Link href={item.path} className="flex items-center justify-between gap-2">
                            <span className="truncate">{item.title}</span>
                            {item.note && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  onOpenNoteModal(item.id, item.title, item.note);
                                }}
                                title={item.note}
                                className="p-0.5 text-amber-500 hover:text-amber-600 shrink-0"
                              >
                                <StickyNote className="w-3 h-3" />
                              </button>
                            )}
                          </Link>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Root Unsorted Favorites */}
        {rootItems.length > 0 && (
          <div className="pt-1">
            {folders.length > 0 && (
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Favoritos Generales</span>
              </div>
            )}
            <div className={cn("space-y-0.5", folders.length > 0 && "pl-3 border-l border-zinc-100 dark:border-zinc-850 ml-3.5")}>
              {rootItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <div
                    key={item.id}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onContextMenuFavItem(e, item);
                    }}
                    className={cn(
                      "group flex items-center justify-between px-2 py-1 rounded-md text-xs transition-colors cursor-pointer",
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-850 font-semibold text-zinc-900 dark:text-white"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                    )}
                  >
                    <Link href={item.path} className="flex-1 flex items-center gap-2 overflow-hidden">
                      <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>

                    {item.note && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onOpenNoteModal(item.id, item.title, item.note);
                        }}
                        title={item.note}
                        className="p-0.5 text-amber-500 hover:text-amber-600 shrink-0"
                      >
                        <StickyNote className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {folders.length === 0 && rootItems.length === 0 && (
          <div className="px-2 py-3 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
              No tienes páginas guardadas en tu espacio de estudio.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
