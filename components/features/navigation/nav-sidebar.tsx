"use client";

import React from "react";
import { Search, PanelLeftClose, PanelLeftOpen, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/hooks/use-navigation";
import { NavTree } from "./nav-tree";
import { NavPage } from "@/types";

interface NavSidebarProps {
  tree: NavPage[];
}

export function NavSidebar({ tree }: NavSidebarProps) {
  const { isSidebarOpen, toggleSidebar, toggleCommandPalette } = useNavigation();

  return (
    <motion.aside
      initial={false}
      animate={{ 
        width: isSidebarOpen ? 280 : 0, 
        opacity: isSidebarOpen ? 1 : 0
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex flex-col sticky top-0 h-screen bg-white border-r border-zinc-200 dark:bg-black dark:border-zinc-800 overflow-hidden"
      )}
    >
      <div className="flex flex-col h-full w-[280px]">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Layers className="text-white dark:text-black w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">LambdaIDX</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <PanelLeftClose className="w-4 h-4 text-zinc-500" />
          </button>
        </div>

        {/* Search Bar Placeholder */}
        <div className="px-4 py-4">
          <div 
            onClick={toggleCommandPalette}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg group cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
          >
            <Search className="w-4 h-4 text-zinc-400" />
            <span className="text-sm text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">Search knowledge...</span>
            <span className="ml-auto text-[10px] text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-1 rounded font-mono">⌘K</span>
          </div>
        </div>

        {/* Navigation Tree */}
        <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Knowledge Tree</h3>
            <NavTree items={tree} />
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-2 px-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">Systems Online</span>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
