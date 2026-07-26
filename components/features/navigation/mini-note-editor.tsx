"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading3,
  List,
  Code,
  Quote,
  Copy,
  Check,
  StickyNote,
  Undo,
  Redo,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniNoteEditorProps {
  value: string;
  onChange: (htmlValue: string) => void;
  placeholder?: string;
}

export function MiniNoteEditor({
  value,
  onChange,
  placeholder = "Escribe tus apuntes de investigación, conceptos clave o hipótesis...",
}: MiniNoteEditorProps) {
  const [isCopied, setIsCopied] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-5 my-2 space-y-1",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-5 my-2 space-y-1",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "leading-normal",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-3 border-indigo-500 pl-3 my-2 italic text-zinc-600 dark:text-zinc-400 bg-indigo-50/50 dark:bg-indigo-950/30 py-1 rounded-r-lg",
          },
        },
        code: {
          HTMLAttributes: {
            class: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md font-mono text-[11px]",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-[11px] text-zinc-100 my-2 overflow-x-auto",
          },
        },
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "mini-note-editor-content focus:outline-hidden min-h-[220px] max-h-[360px] overflow-y-auto p-4 font-sans text-xs text-zinc-900 dark:text-zinc-100 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Sync editor content if external value changes (e.g. switching items in modal)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>");
    }
  }, [value, editor]);

  // Force toolbar re-render on selection update
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const handler = () => setTick((t) => t + 1);
    editor.on("selectionUpdate", handler);
    editor.on("transaction", handler);
    return () => {
      editor.off("selectionUpdate", handler);
      editor.off("transaction", handler);
    };
  }, [editor]);

  const handleCopy = async () => {
    if (!editor) return;
    const text = editor.getText();
    if (!text.trim()) return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };



  const wordCount = useMemo(() => {
    if (!editor) return 0;
    const text = editor.getText().trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
  }, [editor?.getText()]);

  const charCount = useMemo(() => {
    if (!editor) return 0;
    return editor.getText().length;
  }, [editor?.getText()]);

  if (!editor) {
    return (
      <div className="h-[260px] border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-xs text-zinc-400">
        Cargando editor...
      </div>
    );
  }

  return (
    <div className="mini-note-editor flex flex-col border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/60 overflow-hidden transition-all focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/20">
      {/* Scope Styles for Tiptap Rendered Elements */}
      <style jsx global>{`
        .mini-note-editor-content ul {
          list-style-type: disc !important;
          padding-left: 1.25rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .mini-note-editor-content ol {
          list-style-type: decimal !important;
          padding-left: 1.25rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .mini-note-editor-content li {
          display: list-item !important;
          margin-bottom: 0.25rem !important;
        }
        .mini-note-editor-content blockquote {
          border-left: 3px solid #6366f1 !important;
          padding-left: 0.75rem !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
          font-style: italic !important;
          background: rgba(99, 102, 241, 0.05);
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
          border-radius: 0 0.375rem 0.375rem 0;
        }
        .mini-note-editor-content code {
          background-color: rgba(99, 102, 241, 0.15) !important;
          color: #6366f1 !important;
          padding: 0.15rem 0.35rem !important;
          border-radius: 0.375rem !important;
          font-family: monospace !important;
          font-size: 0.85em !important;
        }
        .dark .mini-note-editor-content code {
          color: #818cf8 !important;
        }
        .mini-note-editor-content pre {
          background-color: #09090b !important;
          color: #f4f4f5 !important;
          padding: 0.75rem !important;
          border-radius: 0.5rem !important;
          font-family: monospace !important;
          font-size: 0.85em !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
          overflow-x: auto !important;
        }
        .mini-note-editor-content h2 {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.35rem !important;
        }
        .mini-note-editor-content h3 {
          font-size: 1.1rem !important;
          font-weight: 700 !important;
          margin-top: 0.75rem !important;
          margin-bottom: 0.35rem !important;
        }
        .mini-note-editor-content p {
          margin-bottom: 0.5rem !important;
        }
      `}</style>

      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-1 flex-wrap">
          {/* Bold */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
              editor.isActive("bold")
                ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            )}
            title="Negrita (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          {/* Italic */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
              editor.isActive("italic")
                ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 italic"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            )}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          {/* Heading 3 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(
              "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
              editor.isActive("heading", { level: 3 })
                ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            )}
            title="Encabezado H3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Bullet List */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(
              "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
              editor.isActive("bulletList")
                ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-bold"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            )}
            title="Lista con viñetas"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Inline Code */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={cn(
              "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
              editor.isActive("code")
                ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            )}
            title="Código en línea"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          {/* Code Block */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={cn(
              "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
              editor.isActive("codeBlock")
                ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-mono"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            )}
            title="Bloque de código"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(
              "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
              editor.isActive("blockquote")
                ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white"
            )}
            title="Bloque de cita"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Undo / Redo */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
            title="Deshacer"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer"
            title="Rehacer"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Copy button */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleCopy}
          disabled={!editor.getText().trim()}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0",
            isCopied
              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
          )}
          title="Copiar contenido de la nota"
        >
          {isCopied ? (
            <>
              <Check className="w-3 h-3 text-emerald-500" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/50 dark:bg-zinc-900/50 border-t border-zinc-200/60 dark:border-zinc-800/80 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 shrink-0">
        <div className="flex items-center gap-1.5">
          <StickyNote className="w-3 h-3 text-amber-500 dark:text-amber-400" />
          <span>Mini Editor Tiptap Enriquecido</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{wordCount} palabras</span>
          <span>•</span>
          <span>{charCount} caracteres</span>
        </div>
      </div>
    </div>
  );
}
