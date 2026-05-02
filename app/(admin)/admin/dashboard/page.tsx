"use client";

import React, { useState } from 'react';
import { RichTextEditor } from '@/components/features/editor/rich-text-editor';
import { Save, Eye } from 'lucide-react';

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

  const handleSave = () => {
    // In a real app, we would send jsonContent to the API to save to Prisma
    console.log("Saving JSON to DB:", jsonContent);
    alert("Contenido guardado (revisa la consola para ver el JSON)");
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Knowledge Editor</h1>
          <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase mt-2">
            Status: <span className="text-green-500">SYSTEM_READY</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors font-bold uppercase tracking-widest text-xs flex items-center gap-2">
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
        <div className="mb-4">
          <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            Node Content
          </label>
        </div>
        
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
