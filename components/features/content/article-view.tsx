"use client";

import React, { useState, useCallback } from "react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { TableOfContents } from "./table-of-contents";
import { RelationalPanel } from "./relational-panel";
import { MobileTOC } from "./mobile-toc";
import { ImageLightbox } from "./image-lightbox";
import { ContentViewer } from "./content-viewer";
import { useNavigation } from "@/hooks/use-navigation";
import { useFavorites } from "@/hooks/use-favorites";
import { motion, AnimatePresence } from "framer-motion";
import { PanelRightClose, PanelRightOpen, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface ArticleViewProps {
  title: string;
  content: string;
  contentJson?: Record<string, unknown>;
  breadcrumbs: { title: string; slug: string; href: string }[];
  relations?: { title: string; slug: string; href?: string; type?: string }[];
  tags?: string[];
  resources?: { title: string; url: string; type: string; description?: string | null }[];
}

function splitContentIntoPages(contentJson?: Record<string, unknown>): Record<string, unknown>[] {
  if (!contentJson || contentJson.type !== "doc" || !Array.isArray(contentJson.content)) {
    return contentJson ? [contentJson] : [];
  }

  const pages: Record<string, unknown>[] = [];
  let currentContent: Record<string, unknown>[] = [];

  contentJson.content.forEach((node: unknown) => {
    const nodeObj = node as Record<string, unknown>;
    if (nodeObj && nodeObj.type === "pageBreak") {
      pages.push({
        ...contentJson,
        content: currentContent,
      });
      currentContent = [];
    } else if (nodeObj) {
      currentContent.push(nodeObj);
    }
  });

  pages.push({
    ...contentJson,
    content: currentContent,
  });

  return pages;
}

export function ArticleView({
  title,
  content,
  contentJson,
  breadcrumbs,
  relations,
  tags,
  resources,
}: ArticleViewProps) {
  const { isRightSidebarOpen, toggleRightSidebar } = useNavigation();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Split contentJson into pages
  const pages = React.useMemo(() => {
    return splitContentIntoPages(contentJson);
  }, [contentJson]);

  const totalPages = pages.length;

  // Read current page from query string
  const currentPage = React.useMemo(() => {
    const pageParam = searchParams.get("page");
    if (!pageParam) return 1;
    const pageNum = parseInt(pageParam, 10);
    if (isNaN(pageNum) || pageNum < 1) return 1;
    if (pageNum > totalPages) return totalPages;
    return pageNum;
  }, [searchParams, totalPages]);

  const handlePageChange = useCallback((pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  }, [searchParams, router, pathname]);

  // La tabla de contenido permanece visible siempre que la barra lateral esté abierta, independientemente de la dirección de desplazamiento.
  const isTocVisible = isRightSidebarOpen;

  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setLightboxSrc((target as HTMLImageElement).src);
    }
  }, []);

  const { isFavorite, toggleFavorite } = useFavorites();
  const isPinned = isFavorite(pathname);
  const lastSlug = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].slug : "";

  return (
    <article className="relative min-h-screen">
      {/* ─── HEADER ZONE ─── */}
      <header className="content-grid pt-8 pb-16 md:pt-12 md:pb-20">
        <div>
          <div className="flex items-center justify-between gap-4">
            <Breadcrumbs items={breadcrumbs} />
            <button
              onClick={() => toggleFavorite({ title, path: pathname, slug: lastSlug })}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border shadow-xs cursor-pointer",
                isPinned
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
              title={isPinned ? "Quitar de favoritos" : "Guardar en favoritos de estudio"}
            >
              <Star className={cn("w-3.5 h-3.5 transition-transform duration-200", isPinned && "fill-amber-500 text-amber-500 scale-110")} />
              <span>{isPinned ? "En Favoritos" : "Guardar"}</span>
            </button>
          </div>

          <h1 className="mt-10 text-3xl md:text-6xl lg:text-7xl font-black tracking-tight text-black dark:text-white leading-tight">
            {title}
          </h1>

          <div className="mt-6 flex items-center gap-4 text-xs font-mono text-zinc-400 uppercase tracking-widest">
            <span>LambdaIDX</span>
            <span className="w-1 h-1 rounded-full bg-zinc-600" />
            <span>Knowledge Node</span>
          </div>

          {/* Subtle separator */}
          <div className="mt-12 h-px bg-linear-to-r from-zinc-200 via-zinc-200/50 to-transparent dark:from-zinc-800 dark:via-zinc-800/50" />
        </div>
      </header>

      {/* ─── CONTENT ZONE ───
           This is the rule-free render container.
           Content comes from TipTap / CMS as JSON or HTML.
           The .content-grid ensures text stays at 85ch
           while .breakout children (pre, img, table) go full width.
           .prose-custom handles only typographic styling of child elements. */}
      <div className="content-grid prose-custom" onClick={handleContentClick}>
        {contentJson ? (
          <ContentViewer contentJson={pages[currentPage - 1]} />
        ) : (
          <div
            className="text-lg leading-[1.8] text-zinc-700 dark:text-zinc-300 pb-24"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>

      {/* ─── PAGINATION BAR ─── */}
      {totalPages > 1 && (
        <div className="content-grid mt-16 pb-24">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-6 border-y border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-950/20 rounded-2xl px-6 backdrop-blur-xs">
            {/* Previous Page Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all rounded-lg border",
                currentPage === 1
                  ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-800 text-zinc-400"
                  : "border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Page Indicators */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-mono flex items-center justify-center transition-all",
                      isActive
                        ? "bg-black text-white dark:bg-white dark:text-black font-bold scale-105 shadow-md"
                        : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-white"
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest transition-all rounded-lg border",
                currentPage === totalPages
                  ? "opacity-30 cursor-not-allowed border-zinc-200 dark:border-zinc-800 text-zinc-400"
                  : "border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
              )}
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
              <RelationalPanel
                relatedPages={relations}
                tags={tags}
                resources={resources}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageLightbox 
        src={lightboxSrc} 
        isOpen={!!lightboxSrc} 
        onClose={() => setLightboxSrc(null)} 
      />
    </article>
  );
}
