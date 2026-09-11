"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, FileText, Plus, Settings, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { buildPublicPageHref } from "@/lib/page-paths";
import { NavPage } from "@/types";
import { useNavigation } from "@/hooks/use-navigation";

interface NavTreeProps {
  items: NavPage[];
  depth?: number;
  linkPrefix?: string;
  isAdmin?: boolean;
  slugTrail?: string[];
  onAddPage?: (parentId: string) => void;
  onEditPage?: (pageId: string, currentTitle: string) => void;
  onDeletePage?: (pageId: string) => void;
}

// Helper to recursively find ancestor node IDs for the active path
function findAncestorNodeIds(
  nodes: NavPage[],
  targetPathname: string,
  linkPrefix: string,
  isAdmin: boolean,
  slugTrail: string[] = []
): string[] | null {
  for (const node of nodes) {
    const currentTrail = [...slugTrail, node.slug];
    const nodeLink = isAdmin ? `${linkPrefix}/${node.id}` : buildPublicPageHref(currentTrail);

    if (targetPathname === nodeLink || targetPathname.startsWith(`${nodeLink}/`)) {
      if (node.children && node.children.length > 0) {
        const childAncestors = findAncestorNodeIds(
          node.children,
          targetPathname,
          linkPrefix,
          isAdmin,
          currentTrail
        );
        if (childAncestors) {
          return [node.id, ...childAncestors];
        }
      }
      return [node.id];
    }
  }
  return null;
}

export function NavTree({
  items,
  depth = 0,
  linkPrefix = "/p",
  isAdmin = false,
  slugTrail = [],
  onAddPage,
  onEditPage,
  onDeletePage,
}: NavTreeProps) {
  const pathname = usePathname();
  const { expandedNodes, toggleNode, expandNodes } = useNavigation();

  // Root level single effect for auto-expanding active path hierarchy
  useEffect(() => {
    if (depth !== 0 || !items || items.length === 0 || !pathname) return;

    const ancestorIds = findAncestorNodeIds(items, pathname, linkPrefix, isAdmin);
    if (ancestorIds && ancestorIds.length > 0) {
      expandNodes(ancestorIds);
    }
  }, [depth, items, pathname, linkPrefix, isAdmin, expandNodes]);

  if (!items || items.length === 0) return null;

  return (
    <ul className={cn("space-y-1", depth > 0 && "ml-4 pt-1 border-l border-zinc-200 dark:border-zinc-800")}>
      {items.map((item) => {
        const itemSlugTrail = [...slugTrail, item.slug];
        const itemLink = isAdmin ? `${linkPrefix}/${item.id}` : buildPublicPageHref(itemSlugTrail);
        const isActive = pathname === itemLink;
        const isOpen = expandedNodes.has(item.id);

        return (
          <MemoizedNavTreeItem 
            key={item.id} 
            item={item} 
            depth={depth} 
            linkPrefix={linkPrefix} 
            isAdmin={isAdmin}
            slugTrail={itemSlugTrail}
            isOpen={isOpen}
            isActive={isActive}
            toggleNode={toggleNode}
            onAddPage={onAddPage}
            onEditPage={onEditPage}
            onDeletePage={onDeletePage}
          />
        );
      })}
    </ul>
  );
}

interface NavTreeItemProps {
  item: NavPage;
  depth: number;
  linkPrefix: string;
  isAdmin: boolean;
  slugTrail: string[];
  isOpen: boolean;
  isActive: boolean;
  toggleNode: (id: string) => void;
  onAddPage?: (parentId: string) => void;
  onEditPage?: (pageId: string, currentTitle: string) => void;
  onDeletePage?: (pageId: string) => void;
}

function NavTreeItemComponent({
  item,
  depth,
  linkPrefix,
  isAdmin,
  slugTrail,
  isOpen,
  isActive,
  toggleNode,
  onAddPage,
  onEditPage,
  onDeletePage,
}: NavTreeItemProps) {
  const hasChildren = Boolean(item.children && item.children.length > 0);
  const itemLink = useMemo(() => {
    return isAdmin ? `${linkPrefix}/${item.id}` : buildPublicPageHref(slugTrail);
  }, [isAdmin, linkPrefix, item.id, slugTrail]);

  return (
    <li>
      <div
        className={cn(
          "group flex items-center w-full px-2.5 py-1.5 select-none rounded-lg text-sm transition-colors cursor-pointer",
          isActive 
            ? "bg-zinc-100 text-black dark:bg-zinc-800 dark:text-white font-medium" 
            : "text-zinc-600 hover:text-black hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-900"
        )}
        onClick={() => hasChildren && toggleNode(item.id)}
      >
        <span className="flex items-center justify-center w-5 h-5 mr-1 shrink-0">
          {hasChildren ? (
            <ChevronRight 
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                isOpen && "rotate-90"
              )} 
            />
          ) : (
            <FileText className="w-3.5 h-3.5 opacity-40" />
          )}
        </span>

        <Link 
          href={itemLink} 
          className="flex-1 min-w-0 truncate py-0.5 flex items-center gap-2"
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
              onClick={(e) => { e.stopPropagation(); onAddPage?.(item.id); }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              title="Add child page"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onEditPage?.(item.id, item.title); }}
              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              title="Page Settings"
            >
              <Settings className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeletePage?.(item.id); }}
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
            <NavTree
              items={item.children}
              depth={depth + 1}
              linkPrefix={linkPrefix}
              isAdmin={isAdmin}
              slugTrail={slugTrail}
              onAddPage={onAddPage}
              onEditPage={onEditPage}
              onDeletePage={onDeletePage}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

const MemoizedNavTreeItem = React.memo(
  NavTreeItemComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.title === nextProps.item.title &&
      prevProps.item.status === nextProps.item.status &&
      prevProps.item.children?.length === nextProps.item.children?.length &&
      prevProps.depth === nextProps.depth &&
      prevProps.isOpen === nextProps.isOpen &&
      prevProps.isActive === nextProps.isActive &&
      prevProps.isAdmin === nextProps.isAdmin
    );
  }
);
