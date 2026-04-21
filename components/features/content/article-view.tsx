import React from "react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { TableOfContents } from "./table-of-contents";
import { RelationalPanel } from "./relational-panel";
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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Main Article Container */}
      <article className="flex-1 max-w-[900px] mx-auto px-6 md:px-12 py-10">
        {/* Header Info */}
        <div className="mb-12">
          <Breadcrumbs items={breadcrumbs} />
          
          <h1 className="mt-8 text-4xl md:text-5xl font-extrabold tracking-tight text-black dark:text-white leading-[1.1]">
            {title}
          </h1>
          
          <div className="mt-6 flex items-center gap-4 text-sm text-zinc-400">
             <span>Published in LambdaIDX</span>
             <span className="w-1 h-1 rounded-full bg-zinc-800 dark:bg-zinc-200" />
             <span>5 min read</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="prose-custom pb-20">
          <p className="text-xl leading-relaxed text-zinc-700 dark:text-zinc-300 mb-8">
            {content}
          </p>
          
          <h2 id="core-concepts" className="text-2xl font-bold mt-12 mb-6">Core Concepts</h2>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <h3 id="recursive-logic" className="text-xl font-bold mt-8 mb-4">Recursive Logic</h3>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>

          <h2 id="optimization" className="text-2xl font-bold mt-12 mb-6">Optimization</h2>
          <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
        </div>

        {/* Footer Navigation */}
        <div className="mt-20 pt-10 border-t border-zinc-100 dark:border-zinc-900">
           <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-6">Related Knowledge</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group">
                 <span className="text-[10px] font-bold text-zinc-400 uppercase">Previous</span>
                 <p className="mt-1 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">Getting Started with Nodes</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer group text-right">
                 <span className="text-[10px] font-bold text-zinc-400 uppercase">Next</span>
                 <p className="mt-1 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">Advanced Hierarchical Routing</p>
              </div>
           </div>
        </div>
      </article>

      {/* Auxiliary Right Sidebar */}
      <div className="relative">
        {/* Toggle Button for Right Sidebar (Sticky) */}
        <button
          onClick={toggleRightSidebar}
          className={cn(
            "fixed bottom-8 right-8 lg:top-8 lg:bottom-auto z-50 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:scale-110 transition-all",
            !isRightSidebarOpen && "lg:right-8"
          )}
        >
          {isRightSidebarOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
        </button>

        <AnimatePresence>
          {isRightSidebarOpen && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="hidden lg:block w-80 h-[100vh] sticky top-0 p-8 border-l border-zinc-50 dark:border-zinc-900 overflow-y-auto no-scrollbar"
            >
              <TableOfContents />
              <div className="mt-10 pt-10 border-t border-zinc-50 dark:border-zinc-900">
                <RelationalPanel />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
