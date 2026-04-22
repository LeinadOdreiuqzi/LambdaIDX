"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Folder } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavPage } from "@/types";
import { useNavigation } from "@/hooks/use-navigation";

interface NavTreeProps {
  items: NavPage[];
  depth?: number;
}

export function NavTree({ items, depth = 0 }: NavTreeProps) {
  if (!items || items.length === 0) return null;

  return (
    <ul className={cn("space-y-1", depth > 0 && "ml-4 pt-1 border-l border-zinc-200 dark:border-zinc-800")}>
      {items.map((item) => (
        <NavTreeItem key={item.id} item={item} depth={depth} />
      ))}
    </ul>
  );
}

function NavTreeItem({ item, depth }: { item: NavPage; depth: number }) {
  const pathname = usePathname();
  const { expandedNodes, toggleNode } = useNavigation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = pathname === `/p/${item.slug}`;
  const isOpen = expandedNodes.has(item.id);

  // Auto-expand if active page is a child (only on mount if not already expanded)
  React.useEffect(() => {
    const isChildActive = pathname.startsWith(`/p/${item.slug}/`) || item.children.some(child => pathname === `/p/${child.slug}`);
    if ((isActive || isChildActive) && !isOpen) {
      toggleNode(item.id);
    }
  }, [isActive, item.id, item.slug, item.children, pathname]); // We only want this once for the active route

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
          href={`/p/${item.slug}`} 
          className="flex-1 truncate py-1"
          onClick={(e) => e.stopPropagation()} // Prevent toggle when clicking the link directly
        >
          {item.title}
        </Link>

        {hasChildren && !isOpen && (
          <span className="ml-auto text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
            {item.children.length}
          </span>
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
            <NavTree items={item.children} depth={depth + 1} />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
