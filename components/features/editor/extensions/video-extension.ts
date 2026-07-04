import { Node, mergeAttributes } from '@tiptap/core';

export interface VideoOptions {
  allowFullscreen: boolean;
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    video: {
      setVideo: (options: { src: string }) => ReturnType;
    };
  }
}

export const Video = Node.create<VideoOptions>({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: false,
  selectable: true,

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
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div', 
      { class: 'video-container my-10 rounded-xl overflow-hidden bg-zinc-950 shadow-2xl border border-zinc-800' },
      [
        'video', 
        mergeAttributes(HTMLAttributes, { 
          controls: true, 
          class: 'w-full aspect-video outline-none',
          preload: 'metadata'
        })
      ]
    ];
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
