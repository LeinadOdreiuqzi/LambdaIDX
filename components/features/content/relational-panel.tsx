"use client";

import React from "react";
import Link from "next/link";
import { Link as LinkIcon, Hash, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelationalPanelProps {
  tags?: string[];
  relatedPages?: { title: string; slug: string }[];
  resources?: { title: string; url: string; type: string }[];
}

export function RelationalPanel({ 
  tags = ["React", "TypeScript", "Next.js"], 
  relatedPages = [
    { title: "Advanced Architecture", slug: "advanced-architecture" },
    { title: "Database Optimization", slug: "database-optimization" }
  ],
  resources = [
    { title: "Prisma Documentation", url: "https://prisma.io", type: "Docs" }
  ]
}: RelationalPanelProps) {
  return (
    <div className="space-y-8">
      {/* Relational Card */}
      <div className="p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
          <LinkIcon className="w-3 h-3" />
          Topic Relationships
        </h4>
        
        <div className="space-y-4">
          {relatedPages.map((page) => (
            <Link 
              key={page.slug} 
              href={`/p/${page.slug}`}
              className="block group"
            >
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                {page.title}
              </p>
              <p className="text-[10px] text-zinc-400">Internal Chapter</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-zinc-50 dark:border-zinc-900">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
            <Hash className="w-3 h-3" />
            Tags
          </h4>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span 
                key={tag}
                className="px-2.5 py-1 text-[10px] font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 rounded-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600 hover:text-black dark:hover:text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* External Resources */}
      <div className="px-5">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
          <ExternalLink className="w-3 h-3" />
          Resources
        </h4>
        <ul className="space-y-3">
          {resources.map((res) => (
            <li key={res.url}>
              <a 
                href={res.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center justify-between"
              >
                <span>{res.title}</span>
                <span className="text-[9px] uppercase font-bold tracking-tighter text-zinc-300">{res.type}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
