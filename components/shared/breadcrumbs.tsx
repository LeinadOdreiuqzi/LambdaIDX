import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  title: string;
  slug: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center py-4 text-xs font-medium text-zinc-500 whitespace-nowrap overflow-x-auto no-scrollbar">
      <Link 
        href="/" 
        className="flex items-center hover:text-black dark:hover:text-white transition-colors"
      >
        <Home className="w-3.5 h-3.5 mr-1" />
        <span>Home</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={item.slug}>
          <ChevronRight className="w-3 h-3 mx-2 opacity-20" />
          <Link 
            href={`/p/${item.slug}`}
            className={index === items.length - 1 
              ? "text-black dark:text-white pointer-events-none" 
              : "hover:text-black dark:hover:text-white transition-colors"
            }
          >
            {item.title}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
