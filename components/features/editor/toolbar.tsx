import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  PlusSquare,
  MinusSquare,
  Trash2,
  Columns2,
  Columns3,
  Sigma,
  Info,
  CheckSquare,
  BookOpen,
  Scale,
  ShieldCheck,
  AlertOctagon,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolbarProps {
  editor: Editor | null;
}

export function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  const ToolbarBtn = ({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-8 h-8 flex items-center justify-center transition-colors border border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive
          ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white"
      )}
    >
      {children}
    </button>
  );

  const addImage = () => {
    const url = window.prompt('URL de la imagen (ej. Unsplash):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL del enlace:', previousUrl);
    
    // cancelled
    if (url === null) return;

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 sticky top-0 z-10">
      <div className="flex items-center gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-800">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike">
          <Strikethrough className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code">
          <Code className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-zinc-800">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-zinc-800">
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote">
          <Quote className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-zinc-200 dark:border-zinc-800">
        <ToolbarBtn onClick={setLink} isActive={editor.isActive('link')} title="Link">
          <LinkIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={addImage} title="Image">
          <ImageIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn 
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn 
          onClick={() => editor.chain().focus().insertContent({
            type: 'columnGroup',
            attrs: { cols: 2 },
            content: [
              { type: 'column', content: [{ type: 'paragraph' }] },
              { type: 'column', content: [{ type: 'paragraph' }] }
            ]
          }).run()} 
          title="2 Columns"
        >
          <Columns2 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn 
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
        >
          <Columns3 className="w-4 h-4" />
        </ToolbarBtn>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
        <ToolbarBtn 
          onClick={() => editor.chain().focus().insertContent({ type: 'math', attrs: { latex: 'E = mc^2' } }).insertContent(' ').run()} 
          title="Math Formula (LaTeX)"
        >
          <Sigma className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn 
          onClick={() => editor.chain().focus().insertContent({ 
            type: 'callout', 
            attrs: { type: 'info' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nota científica...' }] }]
          }).run()} 
          title="Info Callout"
        >
          <Info className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn 
          onClick={() => editor.chain().focus().insertContent({ 
            type: 'callout', 
            attrs: { type: 'theorem' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Teorema...' }] }]
          }).run()} 
          title="Theorem"
        >
          <BookOpen className="w-4 h-4 text-indigo-500" />
        </ToolbarBtn>
        <ToolbarBtn 
          onClick={() => editor.chain().focus().insertContent({ 
            type: 'callout', 
            attrs: { type: 'law' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ley científica...' }] }]
          }).run()} 
          title="Scientific Law"
        >
          <Scale className="w-4 h-4 text-teal-500" />
        </ToolbarBtn>
        <ToolbarBtn 
          onClick={() => (editor as any).commands.addFootnote()} 
          title="Insert Footnote / Citation"
        >
          <Hash className="w-4 h-4 text-blue-500" />
        </ToolbarBtn>

        <ToolbarBtn 
          onClick={() => editor.chain().focus().toggleTaskList().run()} 
          isActive={editor.isActive('taskList')}
          title="Task List"
        >
          <CheckSquare className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      <div className="flex items-center gap-1 pl-2 ml-auto">
        <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()} title="Undo">
          <Undo className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()} title="Redo">
          <Redo className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      {/* ─── CONTEXTUAL TABLE TOOLS ─── */}
      {editor.isActive('table') && (
        <div className="flex items-center gap-1 pl-2 ml-2 border-l border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-left-2">
          <ToolbarBtn 
            onClick={() => editor.chain().focus().addColumnAfter().run()} 
            title="Add Column After"
            disabled={!editor.can().addColumnAfter()}
          >
            <div className="flex items-center gap-1">
              <PlusSquare className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">COL</span>
            </div>
          </ToolbarBtn>
          <ToolbarBtn 
            onClick={() => editor.chain().focus().addRowAfter().run()} 
            title="Add Row After"
            disabled={!editor.can().addRowAfter()}
          >
            <div className="flex items-center gap-1">
              <PlusSquare className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono">ROW</span>
            </div>
          </ToolbarBtn>
          <ToolbarBtn 
            onClick={() => editor.chain().focus().deleteColumn().run()} 
            title="Delete Column"
            disabled={!editor.can().deleteColumn()}
          >
            <MinusSquare className="w-3.5 h-3.5 text-red-500" />
          </ToolbarBtn>
          <ToolbarBtn 
            onClick={() => editor.chain().focus().deleteRow().run()} 
            title="Delete Row"
            disabled={!editor.can().deleteRow()}
          >
            <MinusSquare className="w-3.5 h-3.5 text-red-500" />
          </ToolbarBtn>
          <ToolbarBtn 
            onClick={() => editor.chain().focus().deleteTable().run()} 
            title="Delete Table"
            disabled={!editor.can().deleteTable()}
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </ToolbarBtn>
        </div>
      )}
    </div>
  );
}
