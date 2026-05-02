"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { type Editor } from '@tiptap/react';
import { GripVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockHandleProps {
  editor: Editor | null;
}

export function BlockHandle({ editor }: BlockHandleProps) {
  const [menuPosition, setMenuPosition] = useState({ top: 0, opacity: 0 });
  const [currentNodePos, setCurrentNodePos] = useState<number | null>(null);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!editor) return;

    const view = editor.view;
    const editorRect = view.dom.getBoundingClientRect();
    
    // We look for the position at the cursor but slightly inside the editor content
    const coords = { 
      left: editorRect.left + (editorRect.width / 2), 
      top: event.clientY 
    };
    
    const pos = view.posAtCoords(coords);
    if (!pos) return;

    // Find the start of the current block node
    const resolvedPos = view.state.doc.resolve(pos.pos);
    const nodeStart = resolvedPos.start(1);
    
    if (nodeStart !== currentNodePos) {
      const dom = view.nodeDOM(nodeStart - 1) as HTMLElement;
      if (dom && dom.getBoundingClientRect) {
        const rect = dom.getBoundingClientRect();
        setMenuPosition({
          top: rect.top - editorRect.top,
          opacity: 1
        });
        setCurrentNodePos(nodeStart);
      }
    }
  }, [editor, currentNodePos]);

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    dom.addEventListener('mousemove', handleMouseMove);
    return () => dom.removeEventListener('mousemove', handleMouseMove);
  }, [editor, handleMouseMove]);

  if (!editor) return null;

  return (
    <div 
      className="absolute -left-12 z-30 flex items-center h-8 transition-all duration-200"
      style={{ 
        top: `${menuPosition.top}px`, 
        opacity: menuPosition.opacity,
        pointerEvents: menuPosition.opacity === 0 ? 'none' : 'auto' 
      }}
    >
      <div className="flex items-center gap-0.5 group">
        <button 
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          title="Add block"
          onClick={() => {
            if (currentNodePos !== null) {
              editor.chain().focus().insertContentAt(currentNodePos + (editor.state.doc.nodeAt(currentNodePos - 1)?.nodeSize || 0), { type: 'paragraph' }).run();
            }
          }}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button 
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
          draggable
          onDragStart={(e) => {
            // Drag and drop of blocks logic would go here
            // For now it's a visual handle that represents the Notion UI
            e.dataTransfer.setData('text/plain', 'block-drag');
          }}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
