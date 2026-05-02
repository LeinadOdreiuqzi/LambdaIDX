import { Node, mergeAttributes } from '@tiptap/core';

export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: element => element.getAttribute('data-callout-type') || 'info',
        renderHTML: attributes => ({ 
          'data-callout-type': attributes.type,
          class: `callout callout-${attributes.type} p-6 my-8 border-l-4 rounded-r-lg`
        }),
      },
    };
  },

  parseHTML() {
    return [{ 
      tag: 'div[data-callout-type]',
    }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },
});
