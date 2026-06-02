'use client';

import React, { useEffect, useState, useRef } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import katex from 'katex';
import { cn } from '@/lib/utils';

export function MathNodeView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [latex, setLatex] = useState(node.attrs.latex);
  const containerRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if editor is in read-only mode
  const isReadOnly = !editor.isEditable;

  // Sync local state when node attributes change from outside (but not while editing)
  useEffect(() => {
    if (!isEditing) {
      setLatex(node.attrs.latex);
    }
  }, [node.attrs.latex, isEditing]);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(node.attrs.latex, containerRef.current, {
          throwOnError: false,
          displayMode: false,
        });
      } catch (e) {
        console.error('KaTeX error:', e);
      }
    }
  }, [node.attrs.latex]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLatex(val);
    updateAttributes({ latex: val });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditing(false);
      editor.commands.focus();
    }
  };

  return (
    <NodeViewWrapper className="inline-block relative group mx-1">
      <span
        ref={containerRef}
        onClick={!isReadOnly ? (e) => {
          e.stopPropagation();
          setIsEditing(true);
        } : undefined}
        className={cn(
          "inline-block px-1 rounded transition-colors min-w-[1ch] min-h-[1em]",
          !isReadOnly && "cursor-pointer",
          selected || isEditing ? "bg-zinc-100 dark:bg-zinc-800 ring-1 ring-zinc-300 dark:ring-zinc-700" : !isReadOnly && "hover:bg-zinc-50 dark:hover:bg-zinc-900"
        )}
      />

      {!isReadOnly && isEditing && (
        <div
          className="absolute top-full left-0 mt-1 z-50 animate-in fade-in zoom-in duration-150"
          onKeyDown={(e) => e.stopPropagation()}
        >
          <input
            ref={inputRef}
            type="text"
            value={latex}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setIsEditing(false)}
            className="w-48 px-2 py-1 text-xs font-mono bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-lg outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
            placeholder="LaTeX formula..."
          />
        </div>
      )}
    </NodeViewWrapper>
  );
}
