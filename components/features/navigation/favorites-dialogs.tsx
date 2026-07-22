"use client";

import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";
import { FavoriteFolder, PresetColor, PresetIcon } from "@/types/favorites";
import { getFolderIconComponent } from "./nav-favorites-rail";

const PRESET_ICONS: PresetIcon[] = [
  "folder",
  "brain",
  "book",
  "atom",
  "code",
  "graduation-cap",
  "sparkles",
  "bookmark",
];

const PRESET_COLORS: { name: PresetColor; bg: string; border: string }[] = [
  { name: "indigo", bg: "bg-indigo-500", border: "border-indigo-600" },
  { name: "violet", bg: "bg-violet-500", border: "border-violet-600" },
  { name: "emerald", bg: "bg-emerald-500", border: "border-emerald-600" },
  { name: "amber", bg: "bg-amber-500", border: "border-amber-600" },
  { name: "rose", bg: "bg-rose-500", border: "border-rose-600" },
  { name: "cyan", bg: "bg-cyan-500", border: "border-cyan-600" },
  { name: "sky", bg: "bg-sky-500", border: "border-sky-600" },
  { name: "zinc", bg: "bg-zinc-500", border: "border-zinc-600" },
];

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderToEdit?: FavoriteFolder | null;
}

export function FolderModal({ isOpen, onClose, folderToEdit }: FolderModalProps) {
  const { addFolder, updateFolder } = useFavorites();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<PresetIcon>("folder");
  const [selectedColor, setSelectedColor] = useState<PresetColor>("indigo");

  useEffect(() => {
    if (folderToEdit) {
      setName(folderToEdit.name);
      setSelectedIcon((folderToEdit.icon as PresetIcon) || "folder");
      setSelectedColor((folderToEdit.color as PresetColor) || "indigo");
    } else {
      setName("");
      setSelectedIcon("folder");
      setSelectedColor("indigo");
    }
  }, [folderToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (folderToEdit) {
      updateFolder(folderToEdit.id, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
      });
    } else {
      addFolder(name.trim(), selectedIcon, selectedColor);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            {folderToEdit ? "Editar Carpeta de Estudio" : "Nueva Carpeta de Estudio"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Nombre de la carpeta
            </label>
            <input
              type="text"
              autoFocus
              placeholder="Ej: Investigación IA, Física Cuántica..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Color identificador
            </label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                    selectedColor === c.name ? "ring-2 ring-offset-2 ring-indigo-500 scale-110" : "hover:scale-105 opacity-80 hover:opacity-100"
                  }`}
                >
                  {selectedColor === c.name && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Icono de la carpeta
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_ICONS.map((iconKey) => {
                const IconComponent = getFolderIconComponent(iconKey);
                const isSelected = selectedIcon === iconKey;

                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setSelectedIcon(iconKey)}
                    className={`flex items-center justify-center p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-indigo-500/15 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors"
            >
              {folderToEdit ? "Guardar Cambios" : "Crear Carpeta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ResearchNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string | null;
  itemTitle: string;
  initialNote?: string;
}

export function ResearchNoteModal({
  isOpen,
  onClose,
  itemId,
  itemTitle,
  initialNote = "",
}: ResearchNoteModalProps) {
  const { updateFavorite } = useFavorites();
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote, isOpen]);

  if (!isOpen || !itemId) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFavorite(itemId, { note: note.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
            Nota de Estudio: {itemTitle}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Anotación rápida de investigación
            </label>
            <textarea
              rows={4}
              autoFocus
              placeholder="Agrega un recordatorio de estudio, hipótesis o nota importante..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs transition-colors"
            >
              Guardar Nota
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
