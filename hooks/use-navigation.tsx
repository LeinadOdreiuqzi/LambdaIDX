"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface NavigationContextType {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  isRightSidebarOpen: boolean;
  setIsRightSidebarOpen: (open: boolean) => void;
  toggleRightSidebar: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

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

  return (
    <NavigationContext.Provider value={{ 
      isSidebarOpen, 
      setIsSidebarOpen, 
      toggleSidebar,
      isRightSidebarOpen,
      setIsRightSidebarOpen,
      toggleRightSidebar
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
