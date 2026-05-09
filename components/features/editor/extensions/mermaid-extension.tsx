import { Node, NodeViewProps, ReactNodeViewRenderer, mergeAttributes, NodeViewWrapper } from '@tiptap/react';
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { cn } from '@/lib/utils';
import { Code2, Play, AlertCircle } from 'lucide-react';

// Initialize mermaid with refined industrial base theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    fontFamily: 'monospace',
    fontSize: '12px',
    primaryColor: '#f4f4f5', // zinc-100
    primaryTextColor: '#09090b', // zinc-950
    primaryBorderColor: '#71717a', // zinc-500
    lineColor: '#52525b', // zinc-600
    secondaryColor: '#fafafa',
    tertiaryColor: '#ffffff',
    edgeLabelBackground: 'transparent', // Fix for Yes/No labels
    nodeBorder: '#71717a',
  },
  securityLevel: 'loose',
});

const MermaidComponent = ({ node, updateAttributes, selected }: NodeViewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

  const renderDiagram = async () => {
    try {
      const code = node.attrs.code || 'graph TD\n  A[Start] --> B(Process)';
      const { svg: renderedSvg } = await mermaid.render(id, code);
      setSvg(renderedSvg);
      setError(null);
    } catch (err) {
      console.error('Mermaid render error:', err);
      setError('Invalid Diagram Syntax');
    }
  };

  useEffect(() => {
    renderDiagram();
  }, [node.attrs.code]);

  return (
    <NodeViewWrapper className="mermaid-node-wrapper">
      <div className={cn(
        "my-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden transition-all",
        selected ? "ring-2 ring-zinc-500 ring-offset-2 dark:ring-offset-black" : "shadow-sm"
      )}>
        {/* Header / Controls */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">Scientific Diagram</span>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors",
              isEditing 
                ? "bg-black text-white dark:bg-white dark:text-black" 
                : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
            )}
          >
            {isEditing ? 'VIEW DIAGRAM' : 'EDIT SOURCE'}
          </button>
        </div>

        <div className="relative">
          {/* Editor Area */}
          {isEditing && (
            <div className="p-4 bg-zinc-950 font-mono text-sm">
              <textarea
                value={node.attrs.code}
                onChange={(e) => updateAttributes({ code: e.target.value })}
                className="w-full h-40 bg-transparent text-zinc-300 outline-none resize-none custom-scrollbar"
                placeholder="Enter Mermaid code here..."
                spellCheck={false}
              />
              {error && (
                <div className="mt-2 flex items-center gap-2 text-red-400 text-[10px] font-mono">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Preview Area */}
          {!isEditing && (
            <div 
              className="p-8 flex justify-center bg-white dark:bg-transparent min-h-[100px]"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const MermaidExtension = Node.create({
  name: 'mermaid',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      code: {
        default: 'graph TD\n  A[Start] --> B(Process)',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="mermaid"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },

  addCommands() {
    return {
      setMermaid: (code?: string) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { code: code || 'graph TD\n  A[Input] --> B{Process}\n  B -->|Yes| C[Output]\n  B -->|No| D[Error]' },
        });
      },
    };
  },
});

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaid: {
      setMermaid: (code?: string) => ReturnType;
    };
  }
}
