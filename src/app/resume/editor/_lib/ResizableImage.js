import Image from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';

import ImageView from '@/app/resume/editor/_components/ImageView';

// 모서리로 크기를 바꾸고 끌어서 옮길 수 있는 이미지. 글자처럼 문단 안에 들어간다
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => (attributes.width ? { width: attributes.width } : {}),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView, { as: 'span' });
  },

  // 그림만 있던 줄에서 그림이 빠지면 빈 줄이 남는다. 그 줄만 골라 지운다
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageLineCleanup'),
        appendTransaction: (transactions, oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;

          // 바뀌기 전에 그림만 들어 있던 줄
          const sources = [];
          oldState.doc.descendants((node, pos) => {
            if (node.type.name !== 'paragraph') return true;
            if (node.childCount === 1 && node.firstChild.type.name === this.name) sources.push(pos);
            return false;
          });
          if (!sources.length) return null;

          const tr = newState.tr;
          let changed = false;

          sources
            .map((pos) => transactions.reduce((moved, each) => each.mapping.map(moved), pos))
            // 뒤에서부터 지워야 앞쪽 위치가 안 밀린다
            .sort((a, b) => b - a)
            .forEach((pos) => {
              const node = tr.doc.nodeAt(pos);
              if (node?.type.name !== 'paragraph' || node.content.size > 0) return;
              tr.delete(pos, pos + node.nodeSize);
              changed = true;
            });

          return changed ? tr : null;
        },
      }),
    ];
  },
});

export default ResizableImage;
