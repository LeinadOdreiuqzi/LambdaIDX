"use client";

import React, { useState } from "react";
import {
  Link2,
  Hash,
  ExternalLink,
  Plus,
  X,
  Search,
  Trash2,
  BookOpen,
  ArrowRight,
  GraduationCap,
  Bookmark,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export type RelationTypeOption = "RELATED" | "PREREQUISITE" | "NEXT_STEP" | "REFERENCE";
export type ResourceTypeOption = "WEBSITE" | "PDF" | "VIDEO" | "BOOK" | "TOOL" | "ARTICLE";

export interface SelectedPageRelation {
  id: string; // Target page ID
  title: string;
  slug: string;
  type: RelationTypeOption;
}

export interface SelectedResource {
  id: string;
  title: string;
  url: string;
  type: ResourceTypeOption;
  description?: string;
}

interface TopicRelationsEditorProps {
  relations?: SelectedPageRelation[];
  tags?: string[];
  resources?: SelectedResource[];
  onAddRelation?: (relation: SelectedPageRelation) => void;
  onRemoveRelation?: (targetId: string, type: RelationTypeOption) => void;
  onAddTag?: (tag: string) => void;
  onRemoveTag?: (tag: string) => void;
  onAddResource?: (resource: Omit<SelectedResource, "id">) => void;
  onRemoveResource?: (resourceId: string) => void;
  className?: string;
}

const RELATION_TYPE_LABELS: Record<RelationTypeOption, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  RELATED: { label: "Relacionado", icon: Link2, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  PREREQUISITE: { label: "Prerrequisito", icon: GraduationCap, color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  NEXT_STEP: { label: "Siguiente Paso", icon: ArrowRight, color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  REFERENCE: { label: "Referencia", icon: Bookmark, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20" },
};

export function TopicRelationsEditor({
  relations = [],
  tags = [],
  resources = [],
  onAddRelation,
  onRemoveRelation,
  onAddTag,
  onRemoveTag,
  onAddResource,
  onRemoveResource,
  className,
}: TopicRelationsEditorProps) {
  // Local states for component interaction
  const [localRelations, setLocalRelations] = useState<SelectedPageRelation[]>(relations);
  const [localTags, setLocalTags] = useState<string[]>(tags);
  const [localResources, setLocalResources] = useState<SelectedResource[]>(resources);

  // Form inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelationType, setSelectedRelationType] = useState<RelationTypeOption>("RELATED");

  const [newTagInput, setNewTagInput] = useState("");

  const [resTitle, setResTitle] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resType, setResType] = useState<ResourceTypeOption>("WEBSITE");

  const handleRemoveRelation = (id: string, type: RelationTypeOption) => {
    const updated = localRelations.filter(r => !(r.id === id && r.type === type));
    setLocalRelations(updated);
    onRemoveRelation?.(id, type);
  };

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagInput.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");
    if (tag && !localTags.includes(tag)) {
      const updated = [...localTags, tag];
      setLocalTags(updated);
      onAddTag?.(tag);
    }
    setNewTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = localTags.filter(t => t !== tagToRemove);
    setLocalTags(updated);
    onRemoveTag?.(tagToRemove);
  };

  const handleAddResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;
    const newRes: SelectedResource = {
      id: `temp-${Date.now()}`,
      title: resTitle.trim(),
      url: resUrl.trim(),
      type: resType,
    };
    const updated = [...localResources, newRes];
    setLocalResources(updated);
    onAddResource?.({ title: newRes.title, url: newRes.url, type: newRes.type });
    setResTitle("");
    setResUrl("");
  };

  const handleRemoveResource = (id: string) => {
    const updated = localResources.filter(r => r.id !== id);
    setLocalResources(updated);
    onRemoveResource?.(id);
  };

  return (
    <div className={cn("space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-xs", className)}>
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-500" />
            Topic Relationships & Resources
          </h3>
          {/* <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Relaciona esta página con otros temas del conocimiento, asigna etiquetas y enlaza recursos útiles.
          </p> */}
        </div>
      </div>

      {/* ─── SECTION 1: INTERNAL PAGE RELATIONS ─── */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Páginas Relacionadas
        </label>

        {/* Input & Relation Type Select */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar título de página para vincular..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedRelationType}
            onChange={(e) => setSelectedRelationType(e.target.value as RelationTypeOption)}
            className="py-2 px-3 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="RELATED">Relacionado</option>
            <option value="PREREQUISITE">Prerrequisito</option>
            <option value="NEXT_STEP">Siguiente Paso</option>
            <option value="REFERENCE">Referencia</option>
          </select>
        </div>

        {/* List of Connected Relations */}
        <div className="space-y-2 pt-1">
          {localRelations.length === 0 ? (
            <p className="text-xs italic text-zinc-400 dark:text-zinc-500 py-2">
              No hay páginas vinculadas aún.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {localRelations.map((rel) => {
                const config = RELATION_TYPE_LABELS[rel.type] || RELATION_TYPE_LABELS.RELATED;
                const IconComponent = config.icon;
                return (
                  <div
                    key={`${rel.id}-${rel.type}`}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs",
                      config.color
                    )}
                  >
                    <IconComponent className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate max-w-[180px]">{rel.title}</span>
                    <span className="text-[10px] uppercase font-bold opacity-75">({config.label})</span>
                    <button
                      onClick={() => handleRemoveRelation(rel.id, rel.type)}
                      className="ml-1 text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Eliminar relación"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* ─── SECTION 2: TAGS ─── */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Hash className="w-3.5 h-3.5" />
          Etiquetas (Tags)
        </label>

        <form onSubmit={handleAddTagSubmit} className="flex gap-2">
          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            placeholder="Añadir etiqueta (ej: typescript)..."
            className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newTagInput.trim()}
            className="px-3 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {localTags.length === 0 ? (
            <p className="text-xs italic text-zinc-400 dark:text-zinc-500">
              Sin etiquetas asignadas.
            </p>
          ) : (
            localTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

      {/* ─── SECTION 3: EXTERNAL RESOURCES ─── */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <ExternalLink className="w-3.5 h-3.5" />
          Recursos Externos
        </label>

        <form onSubmit={handleAddResourceSubmit} className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              placeholder="Título (ej. Docs Oficiales)"
              className="sm:col-span-2 px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={resType}
              onChange={(e) => setResType(e.target.value as ResourceTypeOption)}
              className="px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="WEBSITE">Web / Link</option>
              <option value="ARTICLE">Artículo</option>
              <option value="VIDEO">Video</option>
              <option value="PDF">PDF</option>
              <option value="BOOK">Libro</option>
              <option value="TOOL">Herramienta</option>
            </select>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={resUrl}
              onChange={(e) => setResUrl(e.target.value)}
              placeholder="URL (https://...)"
              className="flex-1 px-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!resTitle.trim() || !resUrl.trim()}
              className="px-3 py-2 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 disabled:opacity-50 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Enlace</span>
            </button>
          </div>
        </form>

        <div className="space-y-2 pt-1">
          {localResources.length === 0 ? (
            <p className="text-xs italic text-zinc-400 dark:text-zinc-500">
              No se han agregado enlaces externos.
            </p>
          ) : (
            localResources.map((res) => (
              <div
                key={res.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-zinc-800 dark:text-zinc-200 hover:underline truncate"
                  >
                    {res.title}
                  </a>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                    {res.type}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveResource(res.id)}
                  className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer ml-2"
                  title="Eliminar recurso"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
