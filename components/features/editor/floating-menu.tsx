'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Heading2,
  Heading3,
  List,
  ImageIcon,
  Code as CodeIcon,
  Table as TableIcon,
  Columns2,
  Columns3,
  Sigma,
  Info,
  CheckSquare,
  BookOpen,
  Scale,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingMenuProps {
  editor: Editor | null;
}

interface MenuPosition {
  x: number;
  y: number;
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      if (!editor) return;

      // Only intercept right-click inside the editor DOM element
      const editorEl = editor.view.dom;
      if (!editorEl.contains(e.target as Node)) return;

      e.preventDefault();
      e.stopPropagation();

      // Calculate position, keeping menu inside viewport
      const menuWidth = 200;
      const menuHeight = 480;
      const x = Math.min(e.clientX, window.innerWidth - menuWidth - 8);
      const y = Math.min(e.clientY, window.innerHeight - menuHeight - 8);

      setPosition({ x, y });
      setVisible(true);
    },
    [editor]
  );

  const close = useCallback(() => setVisible(false), []);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('mousedown', (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleContextMenu, close]);

  if (!editor || !visible) return null;

  const addImage = () => {
    close();
    const url = window.prompt('URL de la imagen:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const Btn = ({ onClick, title, icon: Icon }: { onClick: () => void; title: string; icon: React.ElementType }) => (
    <button
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
        close();
      }}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors w-full text-left"
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{title}</span>
    </button>
  );

  return (
    <div
      ref={menuRef}
      style={{ position: 'fixed', top: position.y, left: position.x, zIndex: 9999 }}
      className="flex flex-col rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm overflow-hidden min-w-[180px]"
    >
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="H2" icon={Heading2} />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="H3" icon={Heading3} />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} title="List" icon={List} />
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code" icon={CodeIcon} />
      <Btn onClick={addImage} title="Image" icon={ImageIcon} />
      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
      <Btn
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        title="Table"
        icon={TableIcon}
      />
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({
            type: 'columnGroup',
            attrs: { cols: 2 },
            content: [
              { type: 'column', content: [{ type: 'paragraph' }] },
              { type: 'column', content: [{ type: 'paragraph' }] },
            ],
          }).run()
        }
        title="2 Columns"
        icon={Columns2}
      />
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({
            type: 'columnGroup',
            attrs: { cols: 3 },
            content: [
              { type: 'column', content: [{ type: 'paragraph' }] },
              { type: 'column', content: [{ type: 'paragraph' }] },
              { type: 'column', content: [{ type: 'paragraph' }] },
            ],
          }).run()
        }
        title="3 Columns"
        icon={Columns3}
      />
      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({ type: 'math', attrs: { latex: 'E = mc^2' } }).insertContent(' ').run()
        }
        title="Math Formula"
        icon={Sigma}
      />
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({
            type: 'callout',
            attrs: { type: 'info' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nota científica...' }] }],
          }).run()
        }
        title="Info"
        icon={Info}
      />
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({
            type: 'callout',
            attrs: { type: 'theorem' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Teorema...' }] }],
          }).run()
        }
        title="Theorem"
        icon={BookOpen}
      />
      <Btn
        onClick={() =>
          editor.chain().focus().insertContent({
            type: 'callout',
            attrs: { type: 'law' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Scientific Law...' }] }],
          }).run()
        }
        title="Law"
        icon={Scale}
      />
      <Btn onClick={() => (editor as any).commands.addFootnote()} title="Footnote" icon={Hash} />
      <Btn onClick={() => editor.chain().focus().toggleTaskList().run()} title="Task List" icon={CheckSquare} />
    </div>
  );
}
