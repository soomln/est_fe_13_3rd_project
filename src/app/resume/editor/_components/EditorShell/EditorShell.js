'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import useResumeEditor from '@/app/resume/editor/_lib/useResumeEditor';
import UnsavedGuard from '@/app/mypage/_components/UnsavedGuard';
import Toast from '@/app/mypage/_components/Toast';
import EditorHeader from '@/app/resume/editor/_components/EditorHeader';
import EditorToolbar from '@/app/resume/editor/_components/EditorToolbar';
import DocumentPage from '@/app/resume/editor/_components/DocumentPage';
import ChatPanel from '@/app/resume/editor/_components/Chat/Panel';
import styles from './EditorShell.module.sass';

const ZOOM_LEVELS = [50, 60, 70, 80, 90, 100, 110, 125, 150];
const PAGE_WIDTH = 794;
// 처음 열 때 이 배율까지는 알아서 키운다
const FIT_MAX = 125;

export default function EditorShell({ doc, onSave }) {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [title, setTitle] = useState(doc?.title ?? '');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', tone: 'done', id: 0 });
  const docAreaRef = useRef(null);

  const showToast = (message, tone = 'done') =>
    setToast((prev) => ({ message, tone, id: prev.id + 1 }));

  const editor = useResumeEditor({
    content: doc?.contentHtml ?? '',
    onChange: () => setIsDirty(true),
  });

  const save = useCallback(async () => {
    if (!editor || isSaving) return;

    setIsSaving(true);

    try {
      await onSave({
        title: title.trim() || '제목 없음',
        content: editor.getJSON(),
        contentHtml: editor.getHTML(),
        contentText: editor.getText(),
      });
      setIsDirty(false);
      showToast('저장되었습니다');
    } catch {
      showToast('저장하지 못했어요. 잠시 뒤 다시 시도해주세요.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [editor, isSaving, onSave, title]);

  // 처음 열 때 한 장이 다 보이는 배율로 맞춘다
  useEffect(() => {
    const usable = docAreaRef.current?.clientWidth ?? 0;
    const fit = ZOOM_LEVELS.filter((level) => (PAGE_WIDTH * level) / 100 <= usable).pop();
    setZoom(Math.min(FIT_MAX, fit ?? ZOOM_LEVELS[0]));
  }, []);

  const stepZoom = (direction) => {
    setZoom((prev) => {
      const next = ZOOM_LEVELS.indexOf(prev) + direction;
      return ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, Math.max(0, next))];
    });
  };

  return (
    <>
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <UnsavedGuard isDirty={isDirty} />
      <Toast
        key={toast.id}
        message={toast.message}
        tone={toast.tone}
        onHide={() => setToast((prev) => ({ ...prev, message: '' }))}
      />

      <div className={styles.editor_main}>
        <EditorHeader
          isChatOpen={isChatOpen}
          onOpenChat={() => setIsChatOpen(true)}
          title={title}
          onChangeTitle={(next) => {
            setTitle(next);
            setIsDirty(true);
          }}
          isSaving={isSaving}
          onSave={save}
          isStored={Boolean(doc?.id)}
          editor={editor}
        />

        <div className={`${styles.editor_body} ${isChatOpen ? '' : styles.editor_body_wide}`}>
          <EditorToolbar
            editor={editor}
            documentId={doc?.id ?? doc?.draftId}
            onNotify={showToast}
          />

          <div className={styles.editor_doc_area} ref={docAreaRef}>
            <div className={`${styles.editor_doc_pages} ${styles[`editor_doc_pages_${zoom}`]}`}>
              <DocumentPage editor={editor} />
            </div>
          </div>

          <div className={styles.editor_zoom}>
            <button
              type='button'
              className={styles.editor_zoom_btn}
              onClick={() => stepZoom(-1)}
              disabled={zoom === ZOOM_LEVELS[0]}
              aria-label='축소'
            >
              <span className='material-symbols-sharp' aria-hidden='true'>
                remove
              </span>
            </button>

            <span className={`${styles.editor_zoom_value} font_body_s_b`}>{zoom}%</span>

            <button
              type='button'
              className={styles.editor_zoom_btn}
              onClick={() => stepZoom(1)}
              disabled={zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
              aria-label='확대'
            >
              <span className='material-symbols-sharp' aria-hidden='true'>
                add
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
