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
    // Change both border and background color with !important to override Tailwind classes
    // Use 50% transparency (80 in hex) to match the original Tailwind /50 classes
    const styles = color
      ? `border-left-color: ${color} !important; --callout-accent: ${color}; background-color: ${color}80 !important;`
      : '';

    return ['div', mergeAttributes(HTMLAttributes, attrs, { style: styles }), 0];
  },
});
