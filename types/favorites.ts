export interface FavoriteFolder {
  id: string;
  name: string;
  icon?: string; // Icon name key: "book", "brain", "atom", "code", "graduation-cap", "folder", "sparkles", "bookmark"
  color?: string; // HSL/hex or preset color key: "emerald", "indigo", "violet", "amber", "rose", "cyan", "sky", "zinc"
  sortOrder?: number;
  createdAt: string; // ISO string
}

export interface FavoriteItem {
  id: string;
  title: string;
  path: string; // e.g. "/index/introduction"
  slug: string; // e.g. "introduction"
  folderId?: string | null; // null/undefined if stored in root favorites
  note?: string; // Quick student study note
  sortOrder?: number;
  createdAt: string;
}

export type PresetColor = "indigo" | "violet" | "emerald" | "amber" | "rose" | "cyan" | "sky" | "zinc";
export type PresetIcon = "book" | "brain" | "atom" | "code" | "graduation-cap" | "folder" | "sparkles" | "bookmark";
export type SortCriterion = "custom" | "recent" | "alpha";

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: "folder" | "item" | "canvas";
  targetFolder?: FavoriteFolder;
  targetItem?: FavoriteItem;
}
