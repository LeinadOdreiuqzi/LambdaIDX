"use client";

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { ColumnGroup, Column } from '../editor/extensions/column-extension';
import { Callout } from '../editor/extensions/callout-extension';
import { MathNode } from '../editor/extensions/math-node';
import { Video } from '../editor/extensions/video-extension';
import { MermaidExtension } from '../editor/extensions/mermaid-extension';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Footnotes, Footnote, FootnoteReference } from 'tiptap-footnotes';
import 'katex/dist/katex.min.css';

interface ContentViewerProps {
  contentJson: Record<string, unknown>;
}

export function ContentViewer({ contentJson }: ContentViewerProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: false,
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
      Video,
      MermaidExtension,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Footnotes,
      Footnote,
      FootnoteReference,
    ],
    content: contentJson,
    editorProps: {
      attributes: {
        class: 'prose-custom w-full text-lg leading-[1.8] text-zinc-700 dark:text-zinc-300',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
