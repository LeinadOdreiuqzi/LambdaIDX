"use client";

import React, { useState } from 'react';
import { RichTextEditor } from '@/components/features/editor/rich-text-editor';
import { ArticleView } from '@/components/features/content/article-view';
import { Save, Eye, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[200] bg-white dark:bg-[#050505] overflow-y-auto"
          >
            <div className="sticky top-0 z-[210] p-4 flex justify-between items-center bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-zinc-400">
                Live Preview Mode // Rendering Knowledge Node
              </span>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="pb-40">
              <ArticleView 
                title="Knowledge Node Preview" 
                content={content} 
                breadcrumbs={[
                  { title: "Admin", slug: "admin" },
                  { title: "Editor", slug: "dashboard" },
                  { title: "Preview", slug: "preview" }
                ]} 
              />
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
