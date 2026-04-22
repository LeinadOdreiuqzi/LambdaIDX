import React, { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  title: string;
  slug: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const displayItems = useMemo(() => {
    if (items.length <= 3) return items;
    return [
      items[0],
      { title: "...", slug: "collapsed" },
      items[items.length - 1]
    ];
  }, [items]);

  return (
    <nav className="flex items-center py-4 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 whitespace-nowrap overflow-x-auto no-scrollbar">
      <Link 
        href="/" 
        className="flex items-center hover:text-black dark:hover:text-white transition-colors group"
      >
        <Home className="w-3 h-3 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
        <span>Origin</span>
      </Link>

      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const isCollapsed = item.slug === "collapsed";

        return (
          <React.Fragment key={`${item.slug}-${index}`}>
            <ChevronRight className="w-2.5 h-2.5 mx-3 opacity-20" />
            {isCollapsed ? (
              <span className="opacity-40 cursor-default">...</span>
            ) : (
              <Link 
                href={`/p/${item.slug}`}
                className={cn(
                  "transition-all duration-200",
                  isLast 
                    ? "text-zinc-300 dark:text-zinc-100 font-bold pointer-events-none" 
                    : "hover:text-black dark:hover:text-white hover:underline underline-offset-4 decoration-zinc-800"
                )}
              >
                {item.title}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
