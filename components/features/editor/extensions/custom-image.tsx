"use client";

import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from 'lucide-react';

type ImageLayout = 'block-center' | 'wrap-left' | 'wrap-right';

function normalizeImageLayout(layout?: string | null, align?: string | null): ImageLayout {
  if (layout === 'wrap-left' || layout === 'wrap-right' || layout === 'block-center') {
    return layout;
  }

  if (align === 'left') return 'wrap-left';
  if (align === 'right') return 'wrap-right';

  return 'block-center';
}

const ImageResizeComponent = (props: NodeViewProps) => {
  const { node, updateAttributes, selected, editor, deleteNode } = props;
  const { src, alt, title, width, align, layout: rawLayout } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const [startWidth, setStartWidth] = useState(0);
  const [startX, setStartX] = useState(0);

  const isEditable = editor.isEditable;
  const layout = normalizeImageLayout(rawLayout, align);
  const isWrapped = layout === 'wrap-left' || layout === 'wrap-right';

  const wrapperClass = cn(
    "image-node group relative",
    layout === 'block-center' && "block w-full my-10 clear-both",
    layout === 'wrap-left' && "block my-6",
    layout === 'wrap-right' && "block my-6"
  );

  const wrapperStyle = {
    '--image-width': width || (isWrapped ? '40%' : '100%'),
  } as React.CSSProperties;

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
        // Use the editor surface width so the resize math stays stable after moving the node.
        const parentElement = containerRef.current.closest('.ProseMirror') as HTMLElement | null;
        const parentWidth = parentElement ? parentElement.clientWidth : 800;
        
        let newWidth = startWidth + dx;
        if (layout === 'block-center') {
          newWidth = startWidth + dx * 2; // Symmetric growth
        } else if (layout === 'wrap-right') {
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
  }, [resizing, startWidth, startX, layout, updateAttributes]);

  const setLayout = (nextLayout: ImageLayout) => {
    if (nextLayout === 'wrap-left') {
      updateAttributes({
        layout: nextLayout,
        align: 'left',
        width: width && width !== '100%' ? width : '40%',
      });
      return;
    }

    if (nextLayout === 'wrap-right') {
      updateAttributes({
        layout: nextLayout,
        align: 'right',
        width: width && width !== '100%' ? width : '40%',
      });
      return;
    }

    updateAttributes({
      layout: 'block-center',
      align: 'center',
    });
  };

  const setPresetWidth = (pct: number) => {
    updateAttributes({ width: `${pct}%` });
  };

  return (
    <NodeViewWrapper
      className={wrapperClass}
      data-image-layout={layout}
      style={wrapperStyle}
    >
      <div 
        ref={containerRef}
        className={cn(
          "relative max-w-full group",
          layout === 'block-center' && "mx-auto"
        )}
        style={{ width: isWrapped ? '100%' : (width || '100%') }}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          title={title}
          draggable={false}
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
              onClick={() => setLayout('wrap-left')}
              className={cn(
                "p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                layout === 'wrap-left' && "text-white bg-zinc-800"
              )}
              title="Wrap Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayout('block-center')}
              className={cn(
                "p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                layout === 'block-center' && "text-white bg-zinc-800"
              )}
              title="Block"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayout('wrap-right')}
              className={cn(
                "p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors",
                layout === 'wrap-right' && "text-white bg-zinc-800"
              )}
              title="Wrap Right"
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
        parseHTML: element => {
          const style = element.getAttribute('style');
          const widthMatch = style ? style.match(/width:\s*([^;]+)/) : null;
          if (widthMatch) {
            return widthMatch[1].trim();
          }
          return element.getAttribute('data-width') || element.getAttribute('width') || '100%';
        },
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return {
            style: `width: ${attributes.width}`,
            'data-width': attributes.width,
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
      layout: {
        default: 'block-center',
        parseHTML: element => normalizeImageLayout(
          element.getAttribute('data-layout'),
          element.getAttribute('data-align')
        ),
        renderHTML: attributes => {
          const layout = normalizeImageLayout(attributes.layout, attributes.align);
          return {
            'data-layout': layout,
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
});
