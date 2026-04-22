"use client";

import React, { useState } from "react";
import { Menu, X, Layers, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { NavTree } from "./nav-tree";
import { NavPage } from "@/types";
import { useNavigation } from "@/hooks/use-navigation";

interface MobileNavProps {
  tree: NavPage[];
}

export function MobileNav({ tree }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toggleCommandPalette } = useNavigation();

  return (
    <div className="md:hidden">
      {/* Basic Mobile Header */}
      <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          <span className="font-bold">LambdaIDX</span>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-black z-[100] p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Layers className="w-6 h-6" />
                  <span className="font-bold text-xl">LambdaIDX</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <div 
                  onClick={() => {
                    setIsOpen(false);
                    toggleCommandPalette();
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg"
                >
                  <Search className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-400">Search...</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                 <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4">Knowledge Tree</h3>
                 <NavTree items={tree} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
