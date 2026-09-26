"use client";

import React from "react";
import Link from "next/link";
import { Link as LinkIcon, Hash, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPublicPageHref } from "@/lib/page-paths";

interface RelationalPanelProps {
  tags?: string[];
  relatedPages?: { title: string; slug: string; href?: string; type?: string }[];
  resources?: { title: string; url: string; type: string; description?: string | null }[];
}

const RELATION_PRIORITY: Record<string, number> = {
  PREREQUISITE: 1,
  NEXT_STEP: 2,
  RELATED: 3,
  CHILD_TOPIC: 4,
  REFERENCE: 5,
};

const RELATION_TYPE_STYLES: Record<string, { label: string; badgeClass: string }> = {
  PREREQUISITE: {
    label: "Prerrequisito",
    badgeClass: "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold shadow-xs",
  },
  NEXT_STEP: {
    label: "Siguiente Paso",
    badgeClass: "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 font-medium",
  },
  RELATED: {
    label: "Relacionado",
    badgeClass: "bg-zinc-50 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
  },
  CHILD_TOPIC: {
    label: "Subtema",
    badgeClass: "bg-zinc-50 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
  },
  REFERENCE: {
    label: "Referencia",
    badgeClass: "bg-transparent text-zinc-500 dark:text-zinc-500 border-dashed border-zinc-300 dark:border-zinc-800",
  },
};

export function RelationalPanel({ 
  tags = [], 
  relatedPages = [],
  resources = []
}: RelationalPanelProps) {
  const hasContent = relatedPages.length > 0 || tags.length > 0 || resources.length > 0;

  // Sort related pages by pedagogical priority: PREREQUISITE first, then NEXT_STEP, RELATED, CHILD_TOPIC, REFERENCE
  const sortedRelatedPages = React.useMemo(() => {
    return [...relatedPages].sort((a, b) => {
      const priorityA = RELATION_PRIORITY[a.type || ""] ?? 99;
      const priorityB = RELATION_PRIORITY[b.type || ""] ?? 99;
      return priorityA - priorityB;
    });
  }, [relatedPages]);

  if (!hasContent) {
    return (
      <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/40 text-center">
        <p className="text-xs italic text-zinc-400 dark:text-zinc-500">
          Sin relaciones ni recursos adicionales para esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Relational Card */}
      {(sortedRelatedPages.length > 0 || tags.length > 0) && (
        <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          {sortedRelatedPages.length > 0 && (
            <>
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
                <LinkIcon className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                Topic Relationships
              </h4>
              
              <div className="space-y-2.5">
                {sortedRelatedPages.map((page) => {
                  const style = RELATION_TYPE_STYLES[page.type || ""] || {
                    label: page.type || "Nodo Interno",
                    badgeClass: "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800",
                  };
                  return (
                    <Link 
                      key={`${page.slug}-${page.type || 'rel'}`} 
                      href={page.href ?? buildPublicPageHref([page.slug])}
                      className="block group p-2 -mx-2 rounded-lg hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 transition-all duration-150"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                          {page.title}
                        </p>
                        <span className={cn("px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-md border shrink-0 transition-colors", style.badgeClass)}>
                          {style.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {tags.length > 0 && (
            <div className={cn(sortedRelatedPages.length > 0 && "mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-900")}>
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2.5 py-0.5 text-[10px] font-mono border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 rounded-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-black dark:hover:text-white"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* External Resources */}
      {resources.length > 0 && (
        <div className="px-5">
          <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
            Resources
          </h4>
          <ul className="space-y-3">
            {resources.map((res) => {
              const isSafe = /^https?:\/\//i.test(res.url);
              return (
                <li key={res.url}>
                  <a 
                    href={isSafe ? res.url : "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center justify-between gap-2 group"
                  >
                    <span className="truncate group-hover:underline underline-offset-4">{res.title}</span>
                    <span className="text-[9px] font-mono uppercase font-bold tracking-tighter text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded shrink-0">{res.type}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
