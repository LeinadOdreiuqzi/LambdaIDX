import React from 'react';
import { type Editor } from '@tiptap/react';
import { FloatingMenu as TiptapFloatingMenu } from '@tiptap/react/menus';
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

export function FloatingMenu({ editor }: FloatingMenuProps) {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL de la imagen:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const Btn = ({ onClick, title, icon: Icon }: any) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-widest text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{title}</span>
    </button>
  );

  return (
    <TiptapFloatingMenu
      editor={editor}
      className="flex flex-col glass-panel rounded-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 overflow-hidden"
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
        onClick={() => editor.chain().focus().insertContent({
          type: 'columnGroup',
          attrs: { cols: 2 },
          content: [
            { type: 'column', content: [{ type: 'paragraph' }] },
            { type: 'column', content: [{ type: 'paragraph' }] }
          ]
        }).run()} 
        title="2 Columns" 
        icon={Columns2} 
      />
      <Btn 
        onClick={() => editor.chain().focus().insertContent({
          type: 'columnGroup',
          attrs: { cols: 3 },
          content: [
            { type: 'column', content: [{ type: 'paragraph' }] },
            { type: 'column', content: [{ type: 'paragraph' }] },
            { type: 'column', content: [{ type: 'paragraph' }] }
          ]
        }).run()} 
        title="3 Columns" 
        icon={Columns3} 
      />
      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
      <Btn 
        onClick={() => editor.chain().focus().insertContent({ type: 'math', attrs: { latex: 'E = mc^2' } }).insertContent(' ').run()} 
        title="Math Formula" 
        icon={Sigma} 
      />
      <Btn 
        onClick={() => editor.chain().focus().insertContent({ 
          type: 'callout', 
          attrs: { type: 'info' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nota científica...' }] }]
        }).run()} 
        title="Info" 
        icon={Info} 
      />
      <Btn 
        onClick={() => editor.chain().focus().insertContent({ 
          type: 'callout', 
          attrs: { type: 'theorem' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Teorema...' }] }]
        }).run()} 
        title="Theorem" 
        icon={BookOpen} 
      />
      <Btn 
        onClick={() => editor.chain().focus().insertContent({ 
          type: 'callout', 
          attrs: { type: 'law' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Scientific Law...' }] }]
        }).run()} 
        title="Law" 
        icon={Scale} 
      />
      <Btn 
        onClick={() => (editor as any).commands.addFootnote()} 
        title="Footnote" 
        icon={Hash} 
      />
      <Btn 
        onClick={() => editor.chain().focus().toggleTaskList().run()} 
        title="Task List" 
        icon={CheckSquare} 
      />
    </TiptapFloatingMenu>
  );
}
