"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface NavigationContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  expandedNodes: Set<string>;
  toggleNode: (id: string) => void;
  expandNodes: (ids: string[]) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveExpandedNodesDebounced = useCallback((nodesSet: Set<string>) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem("lambdaidx-expanded-nodes", JSON.stringify(Array.from(nodesSet)));
      } catch (e) {
        console.error("Failed to save expanded nodes", e);
      }
    }, 400);
  }, []);

  // Persistence for Left Sidebar
  useEffect(() => {
    const saved = localStorage.getItem("lambdaidx-sidebar");
    if (saved !== null) {
      setIsSidebarOpen(saved === "true");
    } else if (typeof window !== "undefined" && window.location.pathname === "/") {
      setIsSidebarOpen(false);
    }
    
    const savedRight = localStorage.getItem("lambdaidx-right-sidebar");
    if (savedRight !== null) {
      setIsRightSidebarOpen(savedRight === "true");
    }

    const savedNodes = localStorage.getItem("lambdaidx-expanded-nodes");
    if (savedNodes) {
      try {
        setExpandedNodes(new Set(JSON.parse(savedNodes)));
      } catch (e) {
        console.error("Failed to parse expanded nodes", e);
      }
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("lambdaidx-sidebar", String(newState));
      return newState;
    });
  }, []);

  const toggleRightSidebar = useCallback(() => {
    setIsRightSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem("lambdaidx-right-sidebar", String(newState));
      return newState;
    });
  }, []);

  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveExpandedNodesDebounced(next);
      return next;
    });
  }, [saveExpandedNodesDebounced]);

  const expandNodes = useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return;
    setExpandedNodes((prev) => {
      let changed = false;
      const next = new Set(prev);
      for (const id of ids) {
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      }
      if (!changed) return prev;
      saveExpandedNodesDebounced(next);
      return next;
    });
  }, [saveExpandedNodesDebounced]);

  return (
    <NavigationContext.Provider value={{ 
      isSidebarOpen, 
      setIsSidebarOpen, 
      toggleSidebar,
      isRightSidebarOpen,
      setIsRightSidebarOpen,
      toggleRightSidebar,
      isCommandPaletteOpen,
      setIsCommandPaletteOpen,
      toggleCommandPalette,
      expandedNodes,
      toggleNode,
      expandNodes,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
