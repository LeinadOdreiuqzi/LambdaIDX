"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Basic scanner for headings in the article
    const elements = Array.from(document.querySelectorAll("h2, h3"))
      .map((element) => {
        const id = element.id || element.textContent?.toLowerCase().replace(/\s+/g, "-") || "";
        if (!element.id) element.id = id;
        return {
          id,
          title: element.textContent || "",
          level: Number(element.tagName.replace("H", "")),
        };
      });
    setHeadings(elements);

    // Intersection Observer for highlighting active section
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -70% 0%" }
    );

    document.querySelectorAll("h2, h3").forEach((h) => observer.observe(h));

    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <div className="py-2">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-4 px-2">Table of Contents</h4>
      <ul className="space-y-1">
        {headings.map((item) => (
          <li 
            key={item.id}
            className={cn(
              "transition-all duration-200",
              item.level === 3 ? "ml-4" : "ml-0"
            )}
          >
            <a
              href={`#${item.id}`}
              className={cn(
                "block py-1 px-2 rounded-md text-sm transition-colors",
                activeId === item.id
                  ? "text-black dark:text-white font-medium bg-zinc-100 dark:bg-zinc-800"
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
