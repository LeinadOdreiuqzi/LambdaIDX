"use client";

import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

const ImageResizeComponent = (props: NodeViewProps) => {
  const { node, updateAttributes, selected, editor, deleteNode } = props;
  const { src, alt, title, width, align } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const [startWidth, setStartWidth] = useState(0);
  const [startX, setStartX] = useState(0);

  const isEditable = editor.isEditable;

  // Alignments class mapping
  const alignClass = cn(
    "flex w-full my-10",
    align === 'left' && "justify-start",
    align === 'right' && "justify-end",
    (align === 'center' || !align) && "justify-center"
  );

  // Resize handler
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!isEditable) return;
    event.preventDefault();
    event.stopPropagation();
    setResizing(true);
    setStartX(event.clientX);
    if (imageRef.current) {
      setStartWidth(imageRef.current.clientWidth);
    }
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!resizing) return;
      
      const dx = event.clientX - startX;
      
      if (containerRef.current) {
        // Measure parent container to calculate relative percentage
        const parentElement = containerRef.current.parentElement?.parentElement;
        const parentWidth = parentElement ? parentElement.clientWidth : 800;
        
        let newWidth = startWidth + dx;
        if (align === 'center') {
          newWidth = startWidth + dx * 2; // Symmetric growth
        } else if (align === 'right') {
          newWidth = startWidth - dx; // Opposite drag behavior
        }
        
        // Boundaries (min 10% or 100px, max 100%)
        newWidth = Math.max(100, Math.min(newWidth, parentWidth));
        
        const percentage = Math.round((newWidth / parentWidth) * 100);
        updateAttributes({ width: `${percentage}%` });
      }
    };

    const handleMouseUp = () => {
      if (resizing) {
        setResizing(false);
      }
    };

    if (resizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, startWidth, startX, align, updateAttributes]);

  const setAlign = (newAlign: 'left' | 'center' | 'right') => {
    updateAttributes({ align: newAlign });
  };

  const setPresetWidth = (pct: number) => {
    updateAttributes({ width: `${pct}%` });
  };

  return (
    <NodeViewWrapper className={alignClass}>
      <div 
        ref={containerRef}
        className="relative max-w-full group"
        style={{ width: width || '100%' }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          title={title}
          className={cn(
            "rounded-xl object-cover shadow-2xl w-full border border-transparent select-none transition-all",
            isEditable && selected && "border-zinc-500 ring-2 ring-zinc-500/50 dark:ring-zinc-400/50"
          )}
        />
        
        {/* Resize Handle (Only bottom-right in edit mode when selected) */}
        {isEditable && selected && (
          <div 
            onMouseDown={handleMouseDown}
            className="absolute bottom-3 right-3 w-5 h-5 bg-white dark:bg-zinc-900 border-2 border-zinc-800 dark:border-zinc-200 rounded cursor-se-resize z-20 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            title="Drag to resize"
          >
            <div className="w-1.5 h-1.5 bg-zinc-800 dark:bg-zinc-200 rounded-sm" />
          </div>
        )}

        {/* Floating Quick Action Toolbar (only in edit mode when selected) */}
        {isEditable && selected && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 bg-zinc-900/95 dark:bg-zinc-950/95 border border-zinc-800 rounded-lg shadow-2xl z-30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Alignments */}
            <button
              onClick={() => setAlign('left')}
              className={cn(
                "p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                align === 'left' && "text-white bg-zinc-800"
              )}
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAlign('center')}
              className={cn(
                "p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                (align === 'center' || !align) && "text-white bg-zinc-800"
              )}
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setAlign('right')}
              className={cn(
                "p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                align === 'right' && "text-white bg-zinc-800"
              )}
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            
            <div className="w-[1px] h-4 bg-zinc-800 dark:bg-zinc-800 mx-1" />
            
            {/* Presets */}
            {[25, 50, 75, 100].map((pct) => (
              <button
                key={pct}
                onClick={() => setPresetWidth(pct)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                  (width === `${pct}%` || (pct === 100 && !width)) && "text-white bg-zinc-800"
                )}
              >
                {pct}%
              </button>
            ))}

            <div className="w-[1px] h-4 bg-zinc-850 mx-1" />

            {/* Delete button */}
            <button
              onClick={() => deleteNode()}
              className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-950/50 transition-colors"
              title="Delete Image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.style.width || element.getAttribute('width') || '100%',
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return {
            style: `width: ${attributes.width}`,
            width: attributes.width,
          };
        },
      },
      align: {
        default: 'center',
        parseHTML: element => element.getAttribute('data-align') || 'center',
        renderHTML: attributes => {
          if (!attributes.align) return {};
          return {
            'data-align': attributes.align,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
});
