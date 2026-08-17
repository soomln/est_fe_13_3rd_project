'use client';

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Color, FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';

import PageBreaks from '@/app/resume/editor/_lib/pageBreaks';
import ResizableImage from '@/app/resume/editor/_lib/ResizableImage';

// 이력서 본문 편집기. 툴바가 이 editor 를 받아서 명령을 건다
export default function useResumeEditor({ content, onChange }) {
  return useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
        // 끌어서 옮길 때 놓일 자리 표시. 기본값이 검은 1px 이라 글씨처럼 보인다
        dropcursor: { color: '#00A63D', width: 3 },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'listItem'] }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      ResizableImage.configure({ inline: true }),
      PageBreaks,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content ?? '',
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    editorProps: {
      attributes: { role: 'textbox', 'aria-multiline': 'true', 'aria-label': '이력서 본문' },
    },
  });
}
