"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Persistence for Left Sidebar
  useEffect(() => {
    const saved = localStorage.getItem("lambdaidx-sidebar");
    if (saved !== null) {
      setIsSidebarOpen(saved === "true");
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

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    localStorage.setItem("lambdaidx-sidebar", String(newState));
  };

  const toggleRightSidebar = () => {
    const newState = !isRightSidebarOpen;
    setIsRightSidebarOpen(newState);
    localStorage.setItem("lambdaidx-right-sidebar", String(newState));
  };

  const toggleCommandPalette = () => {
    setIsCommandPaletteOpen(!isCommandPaletteOpen);
  };

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("lambdaidx-expanded-nodes", JSON.stringify(Array.from(next)));
      return next;
    });
  };

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
      toggleNode
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
