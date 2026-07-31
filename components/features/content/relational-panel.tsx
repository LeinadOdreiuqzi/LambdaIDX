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

const RELATION_TYPE_LABELS: Record<string, string> = {
  RELATED: "Relacionado",
  PREREQUISITE: "Prerrequisito",
  NEXT_STEP: "Siguiente Paso",
  REFERENCE: "Referencia",
};

export function RelationalPanel({ 
  tags = [], 
  relatedPages = [],
  resources = []
}: RelationalPanelProps) {
  const hasContent = relatedPages.length > 0 || tags.length > 0 || resources.length > 0;

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
      {(relatedPages.length > 0 || tags.length > 0) && (
        <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
          {relatedPages.length > 0 && (
            <>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                <LinkIcon className="w-3 h-3 text-blue-500" />
                Topic Relationships
              </h4>
              
              <div className="space-y-3.5">
                {relatedPages.map((page) => (
                  <Link 
                    key={`${page.slug}-${page.type || 'rel'}`} 
                    href={page.href ?? buildPublicPageHref([page.slug])}
                    className="block group"
                  >
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {page.title}
                    </p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                      <span>{RELATION_TYPE_LABELS[page.type || ""] || "Internal Node"}</span>
                    </p>
                  </Link>
                ))}
              </div>
            </>
          )}

          {tags.length > 0 && (
            <div className={cn(relatedPages.length > 0 && "mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-900")}>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-purple-500" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span 
                    key={tag}
                    className="px-2.5 py-0.5 text-[10px] font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 rounded-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-black dark:hover:text-white"
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
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3 text-emerald-500" />
            Resources
          </h4>
          <ul className="space-y-3">
            {resources.map((res) => (
              <li key={res.url}>
                <a 
                  href={res.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center justify-between gap-2"
                >
                  <span className="truncate">{res.title}</span>
                  <span className="text-[9px] uppercase font-bold tracking-tighter text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">{res.type}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
