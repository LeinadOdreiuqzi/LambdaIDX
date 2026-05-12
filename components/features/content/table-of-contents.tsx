"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Editor } from "@tiptap/react";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  editor?: Editor | null;
}

export function TableOfContents({ editor }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // ─── MODE 1: TIPTAP EDITOR SYNC ───
    if (editor) {
      const updateTiptapHeadings = () => {
        const items: TOCItem[] = [];
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'heading') {
            const title = node.textContent;
            const level = node.attrs.level;
            const id = title.toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "") || `section-${pos}`;
            
            items.push({ id, title, level });
            
            // Inject ID into the node attributes if needed (Tiptap way)
            // Note: This is better handled via an extension, but for TOC sync it's enough to know the ID
          }
        });
        setHeadings(items);
      };

      editor.on('update', updateTiptapHeadings);
      editor.on('selectionUpdate', ({ editor }) => {
        // Find current heading based on selection
        let currentId = "";
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'heading' && pos <= editor.state.selection.from) {
            currentId = node.textContent.toLowerCase()
              .trim()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "") || `section-${pos}`;
          }
        });
        setActiveId(currentId);
      });

      updateTiptapHeadings();
      return () => {
        editor.off('update', updateTiptapHeadings);
      };
    }

    // ─── MODE 2: DOM SCAN FALLBACK (Public Pages) ───
    const scanHeaders = () => {
      const articleBody = document.querySelector(".prose-custom");
      if (!articleBody) return;

      const usedIds = new Set<string>();
      const elements = Array.from(articleBody.querySelectorAll("h2, h3"))
        .map((element) => {
          const text = element.textContent?.trim() || "";
          let id = element.id || text.toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "") || "section";
          
          let uniqueId = id;
          let counter = 1;
          while (usedIds.has(uniqueId)) {
            uniqueId = `${id}-${counter}`;
            counter++;
          }
          
          usedIds.add(uniqueId);
          if (element.id !== uniqueId) element.id = uniqueId;

          return {
            id: uniqueId,
            title: text,
            level: Number(element.tagName.replace("H", "")),
          };
        });
      
      setHeadings(elements);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveId(entry.target.id);
          });
        },
        { rootMargin: "-10% 0% -60% 0%" }
      );

      articleBody.querySelectorAll("h2, h3").forEach((h) => observer.observe(h));
      return observer;
    };

    let intersectionObserver: IntersectionObserver | void;
    const timeoutId = setTimeout(() => {
      intersectionObserver = scanHeaders();
    }, 500);

    const mutationObserver = new MutationObserver(() => {
      if (intersectionObserver) intersectionObserver.disconnect();
      intersectionObserver = scanHeaders();
    });

    const articleBody = document.querySelector(".prose-custom");
    if (articleBody) {
      mutationObserver.observe(articleBody, { childList: true, subtree: true, characterData: true });
    }

    return () => {
      clearTimeout(timeoutId);
      if (intersectionObserver) intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [editor]);

  if (headings.length === 0) return null;

  return (
    <div className="py-2">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4 px-2">Table of Contents</h4>
      <ul className="space-y-1">
        {headings.map((item, index) => (
          <li 
            key={`${item.id}-${index}`}
            className={cn(
              "relative transition-all duration-200",
              item.level === 3 ? "ml-4" : "ml-0"
            )}
          >
            {activeId === item.id && (
              <motion.div
                layoutId="toc-active-pill"
                className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 rounded-md z-0"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <a
              href={`#${item.id}`}
              className={cn(
                "relative z-10 block py-1 px-2 rounded-md text-sm transition-colors",
                activeId === item.id
                  ? "text-black dark:text-white font-medium"
                  : "text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
