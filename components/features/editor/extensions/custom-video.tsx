"use client";

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AlignLeft, AlignCenter, AlignRight, Trash2, Settings } from 'lucide-react';

type VideoLayout = 'block-center' | 'wrap-left' | 'wrap-right';

function normalizeVideoLayout(layout?: string | null, align?: string | null): VideoLayout {
  if (layout === 'wrap-left' || layout === 'wrap-right' || layout === 'block-center') {
    return layout;
  }

  if (align === 'left') return 'wrap-left';
  if (align === 'right') return 'wrap-right';

  return 'block-center';
}

const VideoResizeComponent = (props: NodeViewProps) => {
  const { node, updateAttributes, selected, editor, deleteNode } = props;
  const { src, poster, width, align, layout: rawLayout } = node.attrs;
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [resizing, setResizing] = useState(false);
  const [startWidth, setStartWidth] = useState(0);
  const [startX, setStartX] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const isEditable = editor.isEditable;
  const layout = normalizeVideoLayout(rawLayout, align);
  const isWrapped = layout === 'wrap-left' || layout === 'wrap-right';

  const wrapperClass = cn(
    "video-node group relative",
    layout === 'block-center' && "block w-full my-10 clear-both",
    layout === 'wrap-left' && "float-left my-6",
    layout === 'wrap-right' && "float-right my-6"
  );

  const wrapperStyle = {
    '--video-width': width || (isWrapped ? '40%' : '100%'),
    // Prevent the NodeViewWrapper from overflowing its float context
    maxWidth: '100%',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties;

  // Resize handler
  const handleMouseDown = (event: React.MouseEvent) => {
    if (!isEditable) return;
    event.preventDefault();
    event.stopPropagation();
    setResizing(true);
    setStartX(event.clientX);
    if (videoRef.current) {
      setStartWidth(videoRef.current.clientWidth);
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

  const setLayout = (nextLayout: VideoLayout) => (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always preserve current width when changing layout
    const currentWidth = width || '100%';
    
    if (nextLayout === 'wrap-left') {
      updateAttributes({
        layout: nextLayout,
        align: 'left',
        width: currentWidth,
      });
      return;
    }

    if (nextLayout === 'wrap-right') {
      updateAttributes({
        layout: nextLayout,
        align: 'right',
        width: currentWidth,
      });
      return;
    }

    // For block-center, preserve current width
    updateAttributes({
      layout: 'block-center',
      align: 'center',
      width: currentWidth,
    });
  };

  const setPresetWidth = (pct: number) => {
    updateAttributes({ width: `${pct}%` });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode();
  };

  return (
    <NodeViewWrapper
      className={wrapperClass}
      data-video-layout={layout}
      data-type="video"
      style={wrapperStyle}
    >
      <div 
        ref={containerRef}
        className={cn(
          "relative max-w-full group",
          layout === 'block-center' && "mx-auto"
        )}
        style={{ width: isWrapped ? '100%' : (width || '100%') }}
        onClick={(e) => {
          // Prevent editor from interfering with video container
          e.stopPropagation();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div 
          className="video-container rounded-xl overflow-hidden bg-zinc-950 shadow-2xl border border-zinc-800"
          onClick={(e) => {
            // Prevent editor from interfering with video playback
            e.stopPropagation();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
        >
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            controls={true}
            className="w-full aspect-video outline-none"
            preload="metadata"
          />
        </div>
        
        {/* Settings Button (top-right corner) */}
        {isEditable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-20 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            title="Video settings"
          >
            <Settings className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          </button>
        )}
        
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

        {/* Context Menu Dropdown (only when menuOpen) */}
        {isEditable && menuOpen && (
          <div className="absolute top-12 right-3 flex flex-col gap-1 p-1.5 bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl z-30 backdrop-blur-sm min-w-[200px]">
            {/* Alignments */}
            <div className="flex items-center gap-1 mb-1 pb-1 border-b border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={setLayout('wrap-left')}
                className={cn(
                  "p-1.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0",
                  layout === 'wrap-left' && "text-black bg-zinc-100 dark:text-white dark:bg-zinc-800"
                )}
                title="Wrap Left"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={setLayout('block-center')}
                className={cn(
                  "p-1.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0",
                  layout === 'block-center' && "text-black bg-zinc-100 dark:text-white dark:bg-zinc-800"
                )}
                title="Block"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={setLayout('wrap-right')}
                className={cn(
                  "p-1.5 rounded text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0",
                  layout === 'wrap-right' && "text-black bg-zinc-100 dark:text-white dark:bg-zinc-800"
                )}
                title="Wrap Right"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Presets */}
            <div className="flex flex-wrap gap-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPresetWidth(pct);
                  }}
                  className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-mono font-bold text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0 whitespace-nowrap",
                    (width === `${pct}%` || (pct === 100 && !width)) && "text-black bg-zinc-100 dark:text-white dark:bg-zinc-800"
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="w-full h-[1px] bg-zinc-200 dark:bg-zinc-800 my-1" />

            {/* Delete button */}
            <button
              type="button"
              onClick={handleDelete}
              className="w-full p-1.5 rounded text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/50 transition-colors flex items-center justify-center gap-2"
              title="Delete Video"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Eliminar</span>
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export const CustomVideo = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: false,
  selectable: false,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      poster: {
        default: null,
      },
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
        parseHTML: element => normalizeVideoLayout(
          element.getAttribute('data-layout'),
          element.getAttribute('data-align')
        ),
        renderHTML: attributes => {
          const layout = normalizeVideoLayout(attributes.layout, attributes.align);
          return {
            'data-layout': layout,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-type': 'video' }, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoResizeComponent);
  },

  addCommands() {
    return {
      setVideo: (options) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});
