import { Node, mergeAttributes } from '@tiptap/core';

export const ColumnGroup = Node.create({
  name: 'columnGroup',
  group: 'block',
  content: 'column+',
  
  addAttributes() {
    return {
      cols: {
        default: 2,
        parseHTML: element => element.getAttribute('data-cols') || 2,
        renderHTML: attributes => ({
          'data-cols': attributes.cols,
          'data-type': 'column-group',
          class: 'grid gap-8 my-10 items-start',
          style: `grid-template-columns: repeat(${attributes.cols}, minmax(0, 1fr))`,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="column-group"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },
});

export const Column = Node.create({
  name: 'column',
  content: 'block+',
  
  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'column',
      class: 'min-w-0 border-l border-zinc-100 dark:border-zinc-900 pl-4 first:border-l-0 first:pl-0' 
    }), 0];
  },
});
