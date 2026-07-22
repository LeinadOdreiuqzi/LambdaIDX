"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderPlus,
  Pencil,
  Trash2,
  ExternalLink,
  FolderInput,
  Star,
  StickyNote,
  X,
} from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { ContextMenuState, FavoriteFolder } from "@/types/favorites";

interface FavoritesContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onOpenFolderModal: (folderToEdit?: FavoriteFolder) => void;
  onOpenNoteModal: (itemId: string, currentTitle: string, currentNote?: string) => void;
}

export function FavoritesContextMenu({
  state,
  onClose,
  onOpenFolderModal,
  onOpenNoteModal,
}: FavoritesContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { folders, deleteFolder, removeFavorite, moveFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleScroll = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (state.isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [state.isOpen, onClose]);

  if (!state.isOpen) return null;

  // Prevent context menu from rendering offscreen
  const adjustedX = Math.min(state.x, typeof window !== "undefined" ? window.innerWidth - 220 : state.x);
  const adjustedY = Math.min(state.y, typeof window !== "undefined" ? window.innerHeight - 280 : state.y);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        style={{ top: adjustedY, left: adjustedX }}
        className="fixed z-50 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-1.5 text-xs text-zinc-800 dark:text-zinc-200 select-none"
      >
        {/* Context Menu for Folder */}
        {state.type === "folder" && state.targetFolder && (
          <>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1 flex items-center justify-between">
              <span className="truncate">{state.targetFolder.name}</span>
              <button onClick={onClose} className="p-0.5 hover:text-zinc-600 dark:hover:text-zinc-200">
                <X className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenFolderModal();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Nueva carpeta</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenFolderModal(state.targetFolder);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-zinc-500" />
              <span>Editar carpeta</span>
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => {
                if (state.targetFolder && confirm(`¿Eliminar la carpeta "${state.targetFolder.name}"?`)) {
                  deleteFolder(state.targetFolder.id);
                  onClose();
                }
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar carpeta</span>
            </button>
          </>
        )}

        {/* Context Menu for Favorite Item */}
        {state.type === "item" && state.targetItem && (
          <>
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1 truncate">
              {state.targetItem.title}
            </div>

            <button
              onClick={() => {
                if (state.targetItem) {
                  onClose();
                  onOpenNoteModal(state.targetItem.id, state.targetItem.title, state.targetItem.note);
                }
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <StickyNote className="w-3.5 h-3.5 text-amber-500" />
              <span>Editar nota de estudio</span>
            </button>

            <a
              href={state.targetItem.path}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
              <span>Abrir en nueva pestaña</span>
            </a>

            {/* Move to folder submenu */}
            {folders.length > 0 && (
              <div className="relative group">
                <div className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2">
                    <FolderInput className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Mover a...</span>
                  </div>
                </div>

                <div className="pl-4 py-1 space-y-1 border-l border-zinc-200 dark:border-zinc-800 ml-3">
                  <button
                    onClick={() => {
                      if (state.targetItem) moveFavorite(state.targetItem.id, null);
                      onClose();
                    }}
                    className="w-full text-left px-2 py-1 rounded-md text-[11px] hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Sin carpeta (Raíz)
                  </button>
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        if (state.targetItem) moveFavorite(state.targetItem.id, f.id);
                        onClose();
                      }}
                      className="w-full text-left px-2 py-1 rounded-md text-[11px] hover:bg-zinc-100 dark:hover:bg-zinc-800 truncate"
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />

            <button
              onClick={() => {
                if (state.targetItem) {
                  removeFavorite(state.targetItem.id);
                  onClose();
                }
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Quitar de favoritos</span>
            </button>
          </>
        )}

        {/* Context Menu for Canvas / Empty Rail area */}
        {state.type === "canvas" && (
          <>
            <button
              onClick={() => {
                onClose();
                onOpenFolderModal();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Crear nueva carpeta</span>
            </button>

            <button
              onClick={() => {
                const currentTitle = document.title || window.location.pathname;
                const slug = window.location.pathname.split("/").filter(Boolean).pop() || "";
                toggleFavorite({ title: currentTitle, path: window.location.pathname, slug });
                onClose();
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>Fijar página actual</span>
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
