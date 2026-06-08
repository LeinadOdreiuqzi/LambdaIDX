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
import { PanelLeftOpen, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminClientLayoutProps {
  children: React.ReactNode;
  tree: NavPage[];
}

export function AdminClientLayout({ children, tree }: AdminClientLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useNavigation();
  const pathname = usePathname();
  const isEditorRoute = pathname.startsWith("/admin/editor");

  return (
    <div className="relative flex min-h-screen bg-zinc-100 dark:bg-[#050505] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <IndustrialOverlay />
      
      {/* Background Pattern - Dot Matrix */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(circle, #71717a 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      <NavSidebar tree={tree} linkPrefix="/admin/editor" isAdmin={true} />

      {/* Navigation - Mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
        <MobileNav tree={tree} linkPrefix="/admin/editor" isAdmin={true} />
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

        <div
          className={cn(
            "flex-1 pt-24 md:pt-8",
            isEditorRoute ? "px-3 pb-4 md:px-4 md:pt-0" : "p-8"
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-full",
                isEditorRoute ? "min-h-full" : "mx-auto max-w-7xl"
              )}
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
