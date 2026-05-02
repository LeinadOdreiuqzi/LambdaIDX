import React from 'react';
import { type Editor } from '@tiptap/react';
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BubbleMenuProps {
  editor: Editor | null;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL del enlace:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const Btn = ({ onClick, isActive, children }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "p-1.5 transition-colors",
        isActive 
          ? "text-black dark:text-white" 
          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      )}
    >
      {children}
    </button>
  );

  return (
    <TiptapBubbleMenu
      editor={editor}
      className="flex items-center gap-0.5 p-1 glass-panel rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90"
    >
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
        <Bold className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
        <Italic className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
        <Strikethrough className="w-4 h-4" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
        <Code className="w-4 h-4" />
      </Btn>
      <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1" />
      <Btn onClick={setLink} isActive={editor.isActive('link')}>
        <LinkIcon className="w-4 h-4" />
      </Btn>
    </TiptapBubbleMenu>
  );
}
