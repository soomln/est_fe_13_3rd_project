'use client';

import { EditorContent, useEditorState } from '@tiptap/react';

import { pageBreaksKey } from '@/app/resume/editor/_lib/pageBreaks';
import styles from './DocumentPage.module.sass';

// A4 종이 여러 장. 실제 편집은 Tiptap 이 맡고, 종이는 뒤에 깔린다
export default function DocumentPage({ editor }) {
  const count = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current ? (pageBreaksKey.getState(current.state)?.count ?? 1) : 1,
  });

  return (
    <div className={styles.document_stack}>
      <div className={styles.document_sheets} aria-hidden='true'>
        {Array.from({ length: count ?? 1 }, (_, index) => (
          <div key={index} className={styles.document_sheet} />
        ))}
      </div>

      <EditorContent editor={editor} className={styles.document_page} />
    </div>
  );
}
