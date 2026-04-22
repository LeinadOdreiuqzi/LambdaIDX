"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useNavigation } from "@/hooks/use-navigation";
import { NavSidebar } from "@/components/features/navigation/nav-sidebar";
import { MobileNav } from "@/components/features/navigation/mobile-nav";
import { CommandPalette } from "@/components/shared/command-palette";
import { IndustrialOverlay } from "@/components/shared/industrial-overlay";
import { NavPage } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";

interface PublicClientLayoutProps {
  children: React.ReactNode;
  tree: NavPage[];
}

export function PublicClientLayout({ children, tree }: PublicClientLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useNavigation();
  const pathname = usePathname();

  return (
    <div className="relative flex min-h-screen bg-white dark:bg-black">
      <IndustrialOverlay />
      
      {/* Sidebar - Desktop */}
      <NavSidebar tree={tree} />

      {/* Navigation - Mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
        <MobileNav tree={tree} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        {/* Top Floating Actions (Desktop Only when sidebar is closed) */}
        {!isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-4 left-4 z-50 hidden md:block"
          >
            <button
               onClick={toggleSidebar}
               className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
               <PanelLeftOpen className="w-5 h-5 text-zinc-500" />
            </button>
          </motion.div>
        )}

        <div className="flex-1 pt-16 md:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: "linear" }}
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <CommandPalette tree={tree} />
    </div>
  );
}
