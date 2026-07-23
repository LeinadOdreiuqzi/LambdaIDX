"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Bookmark,
  FileText,
  StickyNote,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteFolder, FavoriteItem, PresetColor } from "@/types/favorites";
import { getFolderIconComponent } from "./nav-favorites-rail";

const COLOR_BADGE_MAP: Record<PresetColor, string> = {
  indigo: "bg-indigo-500 shadow-indigo-500/50",
  violet: "bg-violet-500 shadow-violet-500/50",
  emerald: "bg-emerald-500 shadow-emerald-500/50",
  amber: "bg-amber-500 shadow-amber-500/50",
  rose: "bg-rose-500 shadow-rose-500/50",
  cyan: "bg-cyan-500 shadow-cyan-500/50",
  sky: "bg-sky-500 shadow-sky-500/50",
  zinc: "bg-zinc-400 dark:bg-zinc-500 shadow-zinc-500/50",
};

interface NavFavoritesSectionProps {
  onOpenFolderModal: (folder?: FavoriteFolder) => void;
  onOpenNoteModal: (itemId: string, currentTitle: string, currentNote?: string) => void;
  onContextMenuFolder: (e: React.MouseEvent, folder: FavoriteFolder) => void;
  onContextMenuFavItem: (e: React.MouseEvent, item: FavoriteItem) => void;
  onItemClick?: () => void; // Optional callback for mobile nav auto-close
}

export function NavFavoritesSection({
  onOpenFolderModal,
  onOpenNoteModal,
  onContextMenuFolder,
  onContextMenuFavItem,
  onItemClick,
}: NavFavoritesSectionProps) {
  const pathname = usePathname();
  const { folders, items, moveFavorite } = useFavorites();
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    root: true,
  });

  // Drag and Drop state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
    setDraggedItemId(itemId);
  };

  const handleDragOverFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverFolderId !== folderId) {
      setDragOverFolderId(folderId);
    }
  };

  const handleDragLeaveFolder = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
  };

  const handleDropOnFolder = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const itemId = e.dataTransfer.getData("text/plain") || draggedItemId;
    if (itemId) {
      moveFavorite(itemId, targetFolderId);
      setDraggedItemId(null);
    }
  };

  // Group items by folder
  const rootItems = items.filter((item) => !item.folderId);

  return (
    <div className="mb-6 select-none">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          <Bookmark className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
          <span>Espacio de Estudio</span>
        </div>

        <button
          onClick={() => onOpenFolderModal()}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-md text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
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
          const isDropTarget = dragOverFolderId === folder.id;

          return (
            <div key={folder.id} className="space-y-0.5">
              {/* Folder Row (Drop Zone) */}
              <div
                onContextMenu={(e) => {
                  e.preventDefault();
                  onContextMenuFolder(e, folder);
                }}
                onClick={() => toggleFolderExpand(folder.id)}
                onDragOver={(e) => handleDragOverFolder(e, folder.id)}
                onDragLeave={handleDragLeaveFolder}
                onDrop={(e) => handleDropOnFolder(e, folder.id)}
                className={cn(
                  "group flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border border-transparent",
                  isDropTarget
                    ? "bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 text-indigo-900 dark:text-indigo-200"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/90 dark:hover:text-white"
                )}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="p-0.5 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="relative flex items-center gap-1.5 overflow-hidden">
                    <IconComp className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                    <span className="truncate font-semibold dark:font-normal">{folder.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn("w-1.5 h-1.5 rounded-full shadow-xs", badgeColor)} />
                  <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{folderItems.length}</span>
                </div>
              </div>

              {/* Folder Nested Items */}
              {isExpanded && (
                <div className="pl-6 space-y-0.5 border-l border-zinc-100 dark:border-zinc-800/80 ml-3.5 my-0.5">
                  {folderItems.length === 0 ? (
                    <div className="py-1 px-2 text-[11px] text-zinc-400 dark:text-zinc-600 italic">
                      Carpeta vacía (arrastra aquí)
                    </div>
                  ) : (
                    folderItems.map((item) => {
                      const isActive = pathname === item.path;

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onContextMenuFavItem(e, item);
                          }}
                          className={cn(
                            "group flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all cursor-grab active:cursor-grabbing border border-transparent",
                            isActive
                              ? "bg-zinc-100 dark:bg-zinc-800/90 font-semibold text-zinc-900 dark:text-white border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs"
                              : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white"
                          )}
                        >
                          <Link
                            href={item.path}
                            onClick={onItemClick}
                            className="flex-1 flex items-center gap-1.5 overflow-hidden"
                          >
                            <GripVertical className="w-3 h-3 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
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
                              className="p-0.5 text-amber-500 hover:text-amber-600 dark:text-amber-400 shrink-0"
                            >
                              <StickyNote className="w-3 h-3" />
                            </button>
                          )}
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
          <div
            className="pt-1"
            onDragOver={(e) => handleDragOverFolder(e, "root")}
            onDragLeave={handleDragLeaveFolder}
            onDrop={(e) => handleDropOnFolder(e, null)}
          >
            {folders.length > 0 && (
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <Bookmark className="w-3 h-3" />
                <span>Favoritos Generales</span>
              </div>
            )}
            <div className={cn("space-y-0.5", folders.length > 0 && "pl-3 border-l border-zinc-100 dark:border-zinc-800/80 ml-3.5")}>
              {rootItems.map((item) => {
                const isActive = pathname === item.path;

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onContextMenuFavItem(e, item);
                    }}
                    className={cn(
                      "group flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all cursor-grab active:cursor-grabbing border border-transparent",
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-800/90 font-semibold text-zinc-900 dark:text-white border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs"
                        : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 hover:text-zinc-900 dark:hover:text-white"
                    )}
                  >
                    <Link
                      href={item.path}
                      onClick={onItemClick}
                      className="flex-1 flex items-center gap-1.5 overflow-hidden"
                    >
                      <GripVertical className="w-3 h-3 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                      <FileText className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
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
                        className="p-0.5 text-amber-500 hover:text-amber-600 dark:text-amber-400 shrink-0"
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
          <div className="px-2 py-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-zinc-50/50 dark:bg-zinc-950/40">
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              No tienes páginas guardadas aún.
            </p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
              Guarda tus lecturas presionando el botón &quot;Guardar&quot; en la cabecera de los artículos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
