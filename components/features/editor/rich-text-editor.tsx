"use client";

import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CustomImage } from './extensions/custom-image';
import Link from '@tiptap/extension-link';
import Dropcursor from '@tiptap/extension-dropcursor';
import GlobalDragHandle from 'tiptap-extension-global-drag-handle';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { ColumnGroup, Column } from './extensions/column-extension';
import { Callout } from './extensions/callout-extension';
import { MathNode } from './extensions/math-node';
import { CustomVideo } from './extensions/custom-video';
import { MermaidExtension } from './extensions/mermaid-extension';
import { PageBreak } from './extensions/page-break-extension';
import CharacterCount from '@tiptap/extension-character-count';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Footnotes, Footnote, FootnoteReference } from 'tiptap-footnotes';
import 'katex/dist/katex.min.css';
import { Toolbar } from './toolbar';
import { BubbleMenu } from './bubble-menu';
import { FloatingMenu } from './floating-menu';
import { TableOfContents } from '../content/table-of-contents';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/app/actions/upload';
import { toast } from 'sonner';
import { ListTree } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string, json: Record<string, unknown>) => void;
  className?: string;
  scienceCode?: string;
  documentId?: string;
  contentJson?: Record<string, unknown>;
  disableAutoSave?: boolean;
}

interface RichTextEditorHandle {
  getEditor: () => Editor | null;
}

type DraggingEditorView = {
  dragging?: {
    move: boolean;
  };
};

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({
  content,
  onChange,
  className,
  scienceCode = 'DOC',
  documentId = '0000',
  contentJson,
  disableAutoSave = false
}, ref) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

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
      CustomImage.configure({
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
      CustomVideo,
      MermaidExtension,
      PageBreak,
      CharacterCount,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Footnotes,
      Footnote,
      FootnoteReference,
    ],
    content: contentJson || content,
    editorProps: {
      attributes: {
        // The editor uses flow layout so wrapped images can let following text reuse free space.
        class: cn(
          "editor-prose prose-custom w-full focus:outline-none py-20 pb-40",
          "text-lg leading-[1.8] text-zinc-700 dark:text-zinc-300",
          isFullscreen ? "min-h-screen" : "min-h-[500px]"
        ),
      },
      handleDrop: (view, event, _slice, moved) => {
        // Fix for tiptap-extension-global-drag-handle duplication bug:
        // The extension incorrectly sets view.dragging.move = event.ctrlKey, which causes
        // lines to duplicate when dragged. We restore standard ProseMirror behavior (move unless Ctrl is pressed).
        const dragView = view as typeof view & DraggingEditorView;
        if (dragView.dragging) {
          dragView.dragging.move = !event.ctrlKey;
        }

        // Internal ProseMirror drags must be handled by ProseMirror itself. If we continue,
        // browsers can expose the dragged image as a file and re-trigger the upload path.
        if (event.dataTransfer?.types.includes('application/x-prosemirror-slice')) {
          return false;
        }

        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          const formData = new FormData();
          formData.append('file', file);

          const loadingToast = toast.loading(`Uploading ${file.name}...`);

          uploadFile(formData)
            .then((res) => {
              toast.dismiss(loadingToast);
              toast.success('File uploaded successfully');
              
              if (file.type.startsWith('image/')) {
                const node = view.state.schema.nodes.image.create({ src: res.url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              } else if (file.type.startsWith('video/')) {
                const node = view.state.schema.nodes.video.create({ src: res.url });
                const transaction = view.state.tr.replaceSelectionWith(node);
                view.dispatch(transaction);
              }
            })
            .catch((err) => {
              toast.dismiss(loadingToast);
              toast.error('Failed to upload file');
              console.error(err);
            });
          
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (!disableAutoSave) {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          onChange(editor.getHTML(), editor.getJSON());
        }, 2000); // 2 second debounce for smooth typing experience
      }
    },
  });

  const debounceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastLoadedIdRef = React.useRef<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editor?.destroy();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [editor]);

  // Update editor content when contentJson or documentId changes (e.g., after page load)
  useEffect(() => {
    if (editor && contentJson) {
      const currentContent = editor.getJSON();
      const hasContent = currentContent && currentContent.content && currentContent.content.length > 0;

      // Only set content if we are loading a DIFFERENT document.
      // This prevents losing cursor position and focus during auto-save loops.
      if (lastLoadedIdRef.current !== documentId) {
        // If transitioning from null (new unsaved page) to a concrete ID, and editor already has content,
        // we just sync the ref to avoid resetting the user's active cursor/text.
        if (lastLoadedIdRef.current === null && documentId && hasContent) {
          lastLoadedIdRef.current = documentId;
        } else {
          editor.commands.setContent(contentJson);
          lastLoadedIdRef.current = documentId ?? null;
        }
      }
    }
  }, [contentJson, editor, documentId]);

  // Expose editor methods to parent component
  useImperativeHandle(ref, () => ({
    getEditor: () => editor,
  }));

  return (
    <div className="relative flex w-full items-start gap-6 xl:gap-8">
      {/* Main Editor Column */}
      <div className={cn(
        "flex-1 min-w-0 flex flex-col relative transition-all duration-500 ease-in-out group",
        isFullscreen 
          ? "fixed inset-0 z-100 bg-white dark:bg-black" 
          : "bg-white dark:bg-[#0a0a0a] rounded-xl border border-zinc-300/50 dark:border-zinc-800 shadow-[0_20px_70px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.4)]",
        className
      )}>
        {/* Industrial Meta Badge */}
        {!isFullscreen && (
          <div className="absolute -top-3 -right-3 z-20 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-[8px] font-mono font-bold tracking-[0.2em] rounded-sm shadow-xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
            L-IDX // {scienceCode.toUpperCase()}-{documentId.toUpperCase()}
          </div>
        )}

        <Toolbar 
          editor={editor} 
          isFullscreen={isFullscreen} 
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)} 
        />

        <div className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar relative",
          isFullscreen ? "h-[calc(100vh-64px)]" : "min-h-[calc(100vh-16rem)]"
        )}>
          <div className="w-full">
            <BubbleMenu editor={editor} />
            <FloatingMenu editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Editor Footer - Statistics */}
        {!isFullscreen && (
          <div className="px-6 py-2 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
            <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
              <span>Words: {editor?.storage.characterCount?.words?.() || 0}</span>
              <span>Chars: {editor?.storage.characterCount?.characters?.() || 0}</span>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <span>Read Time: {Math.max(1, Math.ceil((editor?.storage.characterCount?.words?.() || 0) / 200))} MIN</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest text-right">
              LambdaIDX Core v1.0
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Navigation (TOC) */}
      {!isFullscreen && (
        <aside className="w-64 sticky top-24 hidden xl:block">
          <div className="flex items-center gap-2 mb-6 text-zinc-400 dark:text-zinc-600">
            <ListTree className="w-4 h-4" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Navigation Engine</span>
          </div>
          <div className="bg-zinc-50/50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/50 backdrop-blur-sm">
            <TableOfContents editor={editor} />
          </div>
          
          <div className="mt-8 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
              HEADINGS ARE AUTOMATICALLY INDEXED FOR THE SCIENTIFIC CARTOGRAPHY SYSTEM.
            </p>
          </div>
        </aside>
      )}
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';
