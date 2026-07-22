"use client";

import React, { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useNavigation } from "@/hooks/use-navigation";
import { NavSidebar } from "@/components/features/navigation/nav-sidebar";
import { MobileNav } from "@/components/features/navigation/mobile-nav";
import { CommandPalette } from "@/components/shared/command-palette";
import { IndustrialOverlay } from "@/components/shared/industrial-overlay";
import { NavPage } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";

import { FavoritesProvider } from "@/hooks/use-favorites";
import { FavoritesContextMenu } from "@/components/features/navigation/favorites-context-menu";
import { FolderModal, ResearchNoteModal } from "@/components/features/navigation/favorites-dialogs";
import { ContextMenuState, FavoriteFolder } from "@/types/favorites";

interface AdminClientLayoutProps {
  children: React.ReactNode;
  tree: NavPage[];
}

function InnerAdminLayout({ children, tree }: AdminClientLayoutProps) {
  const { isSidebarOpen, toggleSidebar } = useNavigation();
  const pathname = usePathname();
  const isEditorRoute = pathname.startsWith("/admin/editor");

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: "canvas",
  });

  // Modals State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<FavoriteFolder | null>(null);

  const [noteModalState, setNoteModalState] = useState<{
    isOpen: boolean;
    itemId: string | null;
    itemTitle: string;
    note?: string;
  }>({
    isOpen: false,
    itemId: null,
    itemTitle: "",
  });

  const handleOpenFolderModal = useCallback((folder?: FavoriteFolder) => {
    setFolderToEdit(folder || null);
    setIsFolderModalOpen(true);
  }, []);

  const handleOpenNoteModal = useCallback((itemId: string, itemTitle: string, currentNote?: string) => {
    setNoteModalState({
      isOpen: true,
      itemId,
      itemTitle,
      note: currentNote,
    });
  }, []);

  return (
    <div className="relative flex min-h-screen bg-zinc-100 dark:bg-[#050505] selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <IndustrialOverlay />
      
      {/* Background Pattern - Dot Matrix */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.08] dark:opacity-[0.05]" 
           style={{ backgroundImage: 'radial-gradient(circle, #71717a 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      <NavSidebar 
        tree={tree} 
        linkPrefix="/admin/editor" 
        isAdmin={true} 
        onOpenFolderModal={handleOpenFolderModal}
        onOpenNoteModal={handleOpenNoteModal}
        onContextMenuFolder={(e, folder) => {
          setContextMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
            type: "folder",
            targetFolder: folder,
          });
        }}
        onContextMenuFavItem={(e, item) => {
          setContextMenu({
            isOpen: true,
            x: e.clientX,
            y: e.clientY,
            type: "item",
            targetItem: item,
          });
        }}
      />

      {/* Navigation - Mobile */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden">
        <MobileNav 
          tree={tree} 
          linkPrefix="/admin/editor" 
          isAdmin={true} 
          onOpenFolderModal={handleOpenFolderModal}
          onOpenNoteModal={handleOpenNoteModal}
          onContextMenuFolder={(e, folder) => {
            setContextMenu({
              isOpen: true,
              x: e.clientX,
              y: e.clientY,
              type: "folder",
              targetFolder: folder,
            });
          }}
          onContextMenuFavItem={(e, item) => {
            setContextMenu({
              isOpen: true,
              x: e.clientX,
              y: e.clientY,
              type: "item",
              targetItem: item,
            });
          }}
        />
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
               className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
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

      {/* Right-click Context Menu */}
      <FavoritesContextMenu
        state={contextMenu}
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onOpenFolderModal={handleOpenFolderModal}
        onOpenNoteModal={handleOpenNoteModal}
      />

      {/* Custom Dialogs */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        folderToEdit={folderToEdit}
      />

      <ResearchNoteModal
        isOpen={noteModalState.isOpen}
        onClose={() => setNoteModalState((prev) => ({ ...prev, isOpen: false }))}
        itemId={noteModalState.itemId}
        itemTitle={noteModalState.itemTitle}
        initialNote={noteModalState.note}
      />
    </div>
  );
}

export function AdminClientLayout({ children, tree }: AdminClientLayoutProps) {
  return (
    <FavoritesProvider>
      <InnerAdminLayout tree={tree}>{children}</InnerAdminLayout>
    </FavoritesProvider>
  );
}
