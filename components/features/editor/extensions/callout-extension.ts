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
      },
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-callout-color'),
      },
    };
  },

  parseHTML() {
    return [{ 
      tag: 'div[data-callout-type]',
    }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { type, color } = node.attrs;
    
    // Create base attributes
    const attrs = {
      'data-callout-type': type,
      'data-callout-color': color,
      class: `callout callout-${type}`,
    };

    // Inject styles if color is provided
    const styles = color ? `border-left-color: ${color}; --callout-accent: ${color}` : '';

    return ['div', mergeAttributes(HTMLAttributes, attrs, { style: styles }), 0];
  },
});
