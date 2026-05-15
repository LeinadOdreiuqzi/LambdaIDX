"use client";

import React, { useState } from 'react';
import { RichTextEditor } from '@/components/features/editor/rich-text-editor';
import { ArticleView } from '@/components/features/content/article-view';
import { PublicClientLayout } from '@/components/features/navigation/public-client-layout';
import { Save, Eye, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { NavPage } from '@/types';

const INITIAL_CONTENT = `
  <h2>Welcome to the LambdaIDX Editor</h2>
  <p>This is a <strong>fully custom</strong> rich text editor built from scratch using the TipTap core. It is perfectly aligned with the <em>Nothing Design</em> aesthetic.</p>
  <p>Try applying some styles, creating lists, or inserting images using the toolbar above.</p>
  <ul>
    <li>High contrast UI</li>
    <li>Monospaced toolbars</li>
    <li>WYSIWYG accuracy</li>
  </ul>
`;

export default function AdminDashboard() {
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [jsonContent, setJsonContent] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [tree, setTree] = useState<NavPage[]>([]);

  // Fetch tree for preview navigation
  React.useEffect(() => {
    fetch('/api/navigation')
      .then(res => res.json())
      .then(data => setTree(data))
      .catch(err => console.error("Error fetching nav tree:", err));
  }, []);

  // Logic to generate dynamic breadcrumbs for the preview
  const getDynamicBreadcrumbs = () => {
    // 1. Get real Science from the Database Tree
    // We look for the first root node in the tree as a default context
    const rootScience = tree.length > 0 ? tree[0] : null;
    const scienceName = rootScience ? rootScience.title : 'Sin Categoría';
    const scienceSlug = rootScience ? rootScience.slug : 'draft';
    
    // 2. Extract Title from content (Look for first <h2> or <h1>)
    const titleMatch = content.match(/<(h1|h2)[^>]*>(.*?)<\/\1>/);
    const pageTitle = titleMatch ? titleMatch[2].replace(/<[^>]*>/g, '') : 'Nuevo Documento';

    return [
      { title: scienceName, slug: scienceSlug },
      { title: pageTitle, slug: 'preview' }
    ];
  };

  const handleSave = () => {
    // In a real app, we would send jsonContent to the API to save to Prisma
    console.log("Saving JSON to DB:", jsonContent);
    alert("Contenido guardado (revisa la consola para ver el JSON)");
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      {/* ─── PREVIEW OVERLAY ─── */}
      <AnimatePresence>
        {isPreviewOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] bg-white dark:bg-[#050505] overflow-hidden flex flex-col"
          >
            {/* Master Close Button (Always on top) */}
            <div className="fixed top-6 right-6 z-[600]">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="group flex items-center gap-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Close Preview</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Public Layout */}
            <div className="flex-1 overflow-y-auto">
              <PublicClientLayout tree={tree}>
                <div className="pb-40">
                  <ArticleView 
                    title={getDynamicBreadcrumbs()[1].title} 
                    content={content} 
                    breadcrumbs={getDynamicBreadcrumbs()} 
                  />
                </div>
              </PublicClientLayout>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6 px-4 xl:px-0">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Knowledge Editor</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-bold uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity font-bold uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Node
          </button>
        </div>
      </header>

      <section>
        {/* Editor Container */}
        <div className="shadow-2xl shadow-black/5 dark:shadow-black/40">
          <RichTextEditor 
            content={content} 
            onChange={(html, json) => {
              setContent(html);
              setJsonContent(json);
            }} 
          />
        </div>
      </section>
    </div>
  );
}
