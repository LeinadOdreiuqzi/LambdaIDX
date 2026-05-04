"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Folder, Plus, Settings, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavPage } from "@/types";
import { useNavigation } from "@/hooks/use-navigation";

interface NavTreeProps {
  items: NavPage[];
  depth?: number;
  linkPrefix?: string;
  isAdmin?: boolean;
}

export function NavTree({ items, depth = 0, linkPrefix = "/p", isAdmin = false }: NavTreeProps) {
  if (!items || items.length === 0) return null;

  return (
    <ul className={cn("space-y-1", depth > 0 && "ml-4 pt-1 border-l border-zinc-200 dark:border-zinc-800")}>
      {items.map((item) => (
        <NavTreeItem 
          key={item.id} 
          item={item} 
          depth={depth} 
          linkPrefix={linkPrefix} 
          isAdmin={isAdmin}
        />
      ))}
    </ul>
  );
}

function NavTreeItem({ item, depth, linkPrefix, isAdmin }: { item: NavPage; depth: number; linkPrefix: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const { expandedNodes, toggleNode } = useNavigation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === `${linkPrefix}/${item.slug}`;
  const isOpen = expandedNodes.has(item.id);

  // Auto-expand if active page is a child (only on mount if not already expanded)
  React.useEffect(() => {
    const isChildActive = pathname.startsWith(`${linkPrefix}/${item.slug}/`) || item.children.some(child => pathname === `${linkPrefix}/${child.slug}`);
    if ((isActive || isChildActive) && !isOpen) {
      toggleNode(item.id);
    }
  }, [isActive, item.id, item.slug, item.children, pathname, linkPrefix]); // We only want this once for the active route

  return (
    <li>
      <div
        className={cn(
          "group flex items-center px-2 py-1 select-none rounded-md text-sm transition-colors cursor-pointer",
          isActive 
            ? "bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white" 
            : "text-zinc-600 hover:text-black hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900"
        )}
        onClick={() => hasChildren && toggleNode(item.id)}
      >
        <span className="flex items-center justify-center w-5 h-5 mr-1">
          {hasChildren ? (
            <ChevronRight 
              className={cn(
                "w-3 h-3 transition-transform duration-200",
                isOpen && "rotate-90"
              )} 
            />
          ) : (
            <FileText className="w-3 h-3 opacity-40" />
          )}
        </span>

        <Link 
          href={`${linkPrefix}/${item.slug}`} 
          className="flex-1 truncate py-1 flex items-center gap-2"
          onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking the link directly
        >
          {isAdmin && (
            <div 
              className={cn(
                "w-1.5 h-1.5 rounded-full shrink-0",
                item.status === 'PUBLISHED' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : 
                item.status === 'DRAFT' ? "bg-amber-500" : "bg-zinc-400"
              )} 
              title={item.status}
            />
          )}
          <span className="truncate">{item.title}</span>
        </Link>

        {isAdmin ? (
          <div className="hidden group-hover:flex items-center gap-0.5 ml-auto animate-in fade-in slide-in-from-right-1 duration-200">
            <button 
              onClick={(e) => { e.stopPropagation(); console.log('Add child to', item.id); }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              title="Add child page"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); console.log('Edit', item.id); }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              title="Page Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); if(confirm('Delete page?')) console.log('Delete', item.id); }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete page"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ) : (
          hasChildren && !isOpen && (
            <span className="ml-auto text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
              {item.children.length}
            </span>
          )
        )}
      </div>

      <AnimatePresence initial={false}>
        {hasChildren && isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <NavTree items={item.children} depth={depth + 1} linkPrefix={linkPrefix} isAdmin={isAdmin} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
