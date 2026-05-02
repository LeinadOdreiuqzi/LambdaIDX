"use client";

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import BubbleMenuExtension from '@tiptap/extension-bubble-menu';
import FloatingMenuExtension from '@tiptap/extension-floating-menu';
import Dropcursor from '@tiptap/extension-dropcursor';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { ColumnGroup, Column } from './extensions/column-extension';
import { Callout } from './extensions/callout-extension';
import { MathNode } from './extensions/math-node';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import 'katex/dist/katex.min.css';
import { Toolbar } from './toolbar';
import { BubbleMenu } from './bubble-menu';
import { FloatingMenu } from './floating-menu';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string, json: any) => void;
  className?: string;
}

export function RichTextEditor({ content, onChange, className }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-sm overflow-x-auto text-zinc-100 my-10',
          },
        },
        dropcursor: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-xl my-10 w-full object-cover shadow-2xl',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'underline underline-offset-4 cursor-pointer decoration-zinc-400 dark:decoration-zinc-600 hover:decoration-black dark:hover:decoration-white transition-colors',
        },
      }),
      Dropcursor.configure({
        color: '#71717a', // zinc-400
        width: 2,
      }),
      GlobalDragHandle.configure({
        dragHandleWidth: 24,
        scrollThreshold: 0,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-fixed w-full my-10 border border-zinc-200 dark:border-zinc-800',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'bg-zinc-50 dark:bg-zinc-900/50 font-bold border border-zinc-200 dark:border-zinc-800 p-2 text-left text-sm uppercase tracking-widest',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-zinc-200 dark:border-zinc-800 p-3 text-left text-base',
        },
      }),
      ColumnGroup,
      Column,
      Callout,
      MathNode,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        // We inject .content-grid and .prose-custom so it matches the frontend view perfectly
        class: cn(
          "content-grid prose-custom min-h-[500px] w-full focus:outline-none py-20 pb-40",
          "text-lg leading-[1.8] text-zinc-700 dark:text-zinc-300"
        ),
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          const type = file.type;

          if (type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              const node = view.state.schema.nodes.image.create({
                src: readerEvent.target?.result,
              });
              const transaction = view.state.tr.replaceSelectionWith(node);
              view.dispatch(transaction);
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getJSON());
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className={cn("border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] flex flex-col relative", className)}>
      <Toolbar editor={editor} />
      
      <div className="flex-1 overflow-y-auto max-h-[80vh] custom-scrollbar relative px-12">
        <BubbleMenu editor={editor} />
        <FloatingMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
