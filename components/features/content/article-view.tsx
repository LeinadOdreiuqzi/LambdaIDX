"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { TableOfContents } from "./table-of-contents";
import { RelationalPanel } from "./relational-panel";
import { MobileTOC } from "./mobile-toc";
import { useNavigation } from "@/hooks/use-navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArticleViewProps {
  title: string;
  content: string;
  breadcrumbs: { title: string; slug: string }[];
}

export function ArticleView({ title, content, breadcrumbs }: ArticleViewProps) {
  const { isRightSidebarOpen, toggleRightSidebar } = useNavigation();

  // TOC remains visible whenever the sidebar is open, regardless of scroll direction
  const isTocVisible = isRightSidebarOpen;

  return (
    <article className="relative min-h-screen">
      {/* ─── HEADER ZONE ─── */}
      <header className="content-grid pt-8 pb-16 md:pt-12 md:pb-20">
        <div>
          <Breadcrumbs items={breadcrumbs} />

          <h1 className="mt-10 text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter text-black dark:text-white leading-[1.05]">
            {title}
          </h1>

          <div className="mt-8 flex items-center gap-4 text-xs font-mono text-zinc-400 uppercase tracking-widest">
            <span>LambdaIDX</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>Knowledge Node</span>
          </div>

          {/* Subtle separator */}
          <div className="mt-12 h-px bg-gradient-to-r from-zinc-200 via-zinc-200/50 to-transparent dark:from-zinc-800 dark:via-zinc-800/50" />
        </div>
      </header>

      {/* ─── CONTENT ZONE ─── 
           This is the rule-free render container.
           Content comes from TipTap / CMS as HTML.
           The .content-grid ensures text stays at 70ch
           while .breakout children (pre, img, table) go full width.
           .prose-custom handles only typographic styling of child elements. */}
      <div className="content-grid prose-custom">
        <div
          className="text-lg leading-[1.8] text-zinc-700 dark:text-zinc-300 pb-24"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      {/* ─── FLOATING TOC + RELATIONAL PANEL ─── */}
      <button
        onClick={toggleRightSidebar}
        className="fixed bottom-6 right-6 z-50 p-2.5 glass-panel rounded-full hover:scale-110 transition-all hidden md:flex"
        aria-label="Toggle table of contents"
      >
        {isRightSidebarOpen 
          ? <PanelRightClose className="w-4 h-4 text-zinc-600 dark:text-zinc-400" /> 
          : <PanelRightOpen className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        }
      </button>

      <MobileTOC />

      <AnimatePresence>
        {isTocVisible && (
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "fixed top-20 right-6 z-40 w-72 max-h-[70vh] overflow-y-auto no-scrollbar",
              "glass-panel rounded-2xl p-6",
              "hidden lg:block"
            )}
          >
            <TableOfContents />
            <div className="mt-8 pt-8 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <RelationalPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
