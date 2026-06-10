import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      setPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="page-break"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'page-break',
        class: 'page-break my-10 relative flex items-center justify-center pointer-events-none select-none',
      }),
      [
        'div',
        {
          class: 'absolute inset-0 flex items-center',
          ariaHidden: 'true',
        },
        [
          'div',
          {
            class: 'w-full border-t border-dashed border-zinc-300 dark:border-zinc-800',
          },
        ],
      ],
      [
        'div',
        {
          class: 'relative flex justify-center',
        },
        [
          'span',
          {
            class: 'bg-white dark:bg-[#0a0a0a] px-4 text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] border border-zinc-200 dark:border-zinc-800 rounded-full py-1',
          },
          'Salto de Página / Page Break',
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
        });
      },
    };
  },
});
