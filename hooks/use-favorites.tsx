"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { FavoriteFolder, FavoriteItem } from "@/types/favorites";

const STORAGE_KEY = "lambdaidx-study-workspace-v1";
const SYNC_EVENT = "lambdaidx-favorites-change";

interface FavoritesContextType {
  folders: FavoriteFolder[];
  items: FavoriteItem[];
  isLoaded: boolean;
  activeFolderId: string | null; // null means "All" or "Unsorted"
  setActiveFolderId: (folderId: string | null) => void;

  // Folder Actions
  addFolder: (name: string, icon?: string, color?: string) => FavoriteFolder;
  updateFolder: (id: string, updates: Partial<Pick<FavoriteFolder, "name" | "icon" | "color">>) => void;
  deleteFolder: (id: string) => void;

  // Item Actions
  addFavorite: (item: Omit<FavoriteItem, "id" | "createdAt">) => FavoriteItem;
  updateFavorite: (id: string, updates: Partial<Pick<FavoriteItem, "title" | "note" | "folderId">>) => void;
  removeFavorite: (idOrPath: string) => void;
  moveFavorite: (itemId: string, targetFolderId: string | null) => void;

  // Helpers
  isFavorite: (path: string) => boolean;
  getFavoriteByPath: (path: string) => FavoriteItem | undefined;
  toggleFavorite: (page: { title: string; path: string; slug: string }, folderId?: string | null) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

const DEFAULT_FOLDERS: FavoriteFolder[] = [
  {
    id: "folder-research-default",
    name: "General Study",
    icon: "brain",
    color: "indigo",
    createdAt: new Date().toISOString(),
  },
];

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Read state from localStorage
  const loadData = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setFolders(Array.isArray(parsed.folders) ? parsed.folders : DEFAULT_FOLDERS);
        setItems(Array.isArray(parsed.items) ? parsed.items : []);
      } else {
        setFolders(DEFAULT_FOLDERS);
        setItems([]);
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
      setFolders(DEFAULT_FOLDERS);
      setItems([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Write state to localStorage and broadcast event
  const saveData = useCallback((newFolders: FavoriteFolder[], newItems: FavoriteItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ folders: newFolders, items: newItems }));
      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener(SYNC_EVENT, handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener(SYNC_EVENT, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadData]);

  // Folder CRUD
  const addFolder = useCallback(
    (name: string, icon = "folder", color = "indigo"): FavoriteFolder => {
      const newFolder: FavoriteFolder = {
        id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim() || "Nueva Carpeta",
        icon,
        color,
        createdAt: new Date().toISOString(),
      };
      const updatedFolders = [...folders, newFolder];
      setFolders(updatedFolders);
      saveData(updatedFolders, items);
      return newFolder;
    },
    [folders, items, saveData]
  );

  const updateFolder = useCallback(
    (id: string, updates: Partial<Pick<FavoriteFolder, "name" | "icon" | "color">>) => {
      const updatedFolders = folders.map((f) => (f.id === id ? { ...f, ...updates } : f));
      setFolders(updatedFolders);
      saveData(updatedFolders, items);
    },
    [folders, items, saveData]
  );

  const deleteFolder = useCallback(
    (id: string) => {
      const updatedFolders = folders.filter((f) => f.id !== id);
      // Items inside deleted folder move to root (folderId = null)
      const updatedItems = items.map((item) => (item.folderId === id ? { ...item, folderId: null } : item));
      setFolders(updatedFolders);
      setItems(updatedItems);
      if (activeFolderId === id) setActiveFolderId(null);
      saveData(updatedFolders, updatedItems);
    },
    [folders, items, activeFolderId, saveData]
  );

  // Item CRUD
  const addFavorite = useCallback(
    (itemData: Omit<FavoriteItem, "id" | "createdAt">): FavoriteItem => {
      const newItem: FavoriteItem = {
        ...itemData,
        id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };

      // Prevent duplicate paths
      const existing = items.find((i) => i.path === itemData.path);
      let updatedItems: FavoriteItem[];
      if (existing) {
        updatedItems = items.map((i) => (i.path === itemData.path ? { ...i, ...itemData } : i));
      } else {
        updatedItems = [...items, newItem];
      }

      setItems(updatedItems);
      saveData(folders, updatedItems);
      return newItem;
    },
    [folders, items, saveData]
  );

  const updateFavorite = useCallback(
    (id: string, updates: Partial<Pick<FavoriteItem, "title" | "note" | "folderId">>) => {
      const updatedItems = items.map((i) => (i.id === id ? { ...i, ...updates } : i));
      setItems(updatedItems);
      saveData(folders, updatedItems);
    },
    [folders, items, saveData]
  );

  const removeFavorite = useCallback(
    (idOrPath: string) => {
      const updatedItems = items.filter((i) => i.id !== idOrPath && i.path !== idOrPath);
      setItems(updatedItems);
      saveData(folders, updatedItems);
    },
    [folders, items, saveData]
  );

  const moveFavorite = useCallback(
    (itemId: string, targetFolderId: string | null) => {
      const updatedItems = items.map((i) => (i.id === itemId ? { ...i, folderId: targetFolderId } : i));
      setItems(updatedItems);
      saveData(folders, updatedItems);
    },
    [folders, items, saveData]
  );

  // Helpers
  const isFavorite = useCallback(
    (path: string) => {
      return items.some((i) => i.path === path);
    },
    [items]
  );

  const getFavoriteByPath = useCallback(
    (path: string) => {
      return items.find((i) => i.path === path);
    },
    [items]
  );

  const toggleFavorite = useCallback(
    (page: { title: string; path: string; slug: string }, folderId: string | null = null): boolean => {
      const existing = items.find((i) => i.path === page.path);
      if (existing) {
        removeFavorite(existing.id);
        return false;
      } else {
        addFavorite({
          title: page.title,
          path: page.path,
          slug: page.slug,
          folderId: folderId || activeFolderId,
        });
        return true;
      }
    },
    [items, activeFolderId, addFavorite, removeFavorite]
  );

  return (
    <FavoritesContext.Provider
      value={{
        folders,
        items,
        isLoaded,
        activeFolderId,
        setActiveFolderId,
        addFolder,
        updateFolder,
        deleteFolder,
        addFavorite,
        updateFavorite,
        removeFavorite,
        moveFavorite,
        isFavorite,
        getFavoriteByPath,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
