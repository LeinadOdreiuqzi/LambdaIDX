import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { MathNodeView } from './math-node-view';

export const MathNode = Node.create({
  name: 'math',
  group: 'inline',
  inline: true,
  selectable: false,
  draggable: false,
  atom: true,

  addAttributes() {
    return {
      latex: {
        default: 'E = mc^2',
        parseHTML: element => element.getAttribute('data-latex'),
        renderHTML: attributes => ({ 'data-latex': attributes.latex }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="math"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'math' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView, {
      stopEvent: ({ event }) => {
        return (event.target as HTMLElement).closest('input') !== null;
      },
    });
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /(?:^|\s)\$([^$]+)\$$/,
        type: this.type,
        getAttributes: match => ({ latex: match[1] }),
      }),
    ];
  },
});
