'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useEditorState } from '@tiptap/react';

import styles from './EditorHeader.module.sass';

const BLINK_MS = 900;
const TIP_STAY_MS = 3000;

// 인쇄 미디어쿼리의 기준 폭은 화면이 아니라 종이(A4 약 794px)다.
// 그래서 1280px 미만용 안내 화면이 켜지고 본문이 숨는다. 인쇄하는 동안만 되돌린다
function keepOnlyDocument() {
  const root = document.querySelector('.ProseMirror')?.closest('body > *');
  if (!root) return null;

  root.dataset.printRoot = 'true';

  const sheet = document.createElement('style');
  sheet.textContent =
    '@media print{body>*:not([data-print-root]){display:none!important}' +
    'body>[data-print-root]{display:block!important}}';
  document.head.append(sheet);

  return () => {
    sheet.remove();
    delete root.dataset.printRoot;
  };
}

export default function EditorHeader({
  isChatOpen,
  onOpenChat,
  title,
  onChangeTitle,
  isSaving,
  onSave,
  isStored,
  isDownloading,
  onDownload,
  editor,
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // 이게 없으면 되돌리기·다시하기 버튼이 처음 상태로 굳는다
  const history = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      canUndo: Boolean(current?.can().undo()),
      canRedo: Boolean(current?.can().redo()),
    }),
  });
  // 양식으로 새로 만든 문서는 저장을 눌러야 문서함에 들어간다
  const [isSaved, setIsSaved] = useState(false);
  const canExport = isStored || isSaved;
  // 눌렀을 때 잠깐 더 붙잡아 둔다
  const [isPinned, setIsPinned] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  // 연속으로 눌러도 깜빡임이 다시 시작되도록 강제로 다시 그린다
  const [blinkKey, setBlinkKey] = useState(0);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  // 인쇄 버튼이든 Ctrl+P 든 브라우저가 인쇄를 시작할 때 걸리도록 beforeprint 에 붙인다.
  // 인쇄 대화상자의 파일 이름은 문서 제목에서 온다
  useEffect(() => {
    let undo = null;
    let previous = '';

    const before = () => {
      previous = document.title;
      document.title = title.trim() || '이력서';
      undo = keepOnlyDocument();
    };

    const after = () => {
      document.title = previous;
      undo?.();
      undo = null;
    };

    window.addEventListener('beforeprint', before);
    window.addEventListener('afterprint', after);

    return () => {
      window.removeEventListener('beforeprint', before);
      window.removeEventListener('afterprint', after);
      undo?.();
    };
  }, [title]);

  const handlePrint = () => window.print();

  // 문서함에 없으면 인쇄도 다운로드도 막고 저장 버튼을 깜빡인다
  const guard = (action) => () => {
    if (canExport) {
      action();
      return;
    }

    clearTimers();
    setIsPinned(true);
    setIsBlinking(true);
    setBlinkKey((prev) => prev + 1);
    timersRef.current.push(
      setTimeout(() => setIsBlinking(false), BLINK_MS),
      setTimeout(() => setIsPinned(false), TIP_STAY_MS)
    );
  };

  // 마우스를 올렸을 때 안내가 뜨는 건 스타일이 맡는다
  const exportProps = { 'aria-disabled': !canExport };

  const handleSave = async () => {
    clearTimers();
    setIsPinned(false);
    setIsBlinking(false);
    await onSave?.();
    setIsSaved(true);
  };

  return (
    <header
      className={`${styles.editor_header} ${isChatOpen ? '' : styles.editor_header_wide}`}
    >
      <div className={styles.editor_header_left}>
        {!isChatOpen && (
          <button
            type='button'
            className={`${styles.editor_header_expand} font_body_m_b`}
            onClick={onOpenChat}
            aria-label='AI 코치 펼치기'
          >
            AI
            <span className='material-symbols-sharp' aria-hidden='true'>
              keyboard_double_arrow_right
            </span>
          </button>
        )}

        <Link href='/resume/free-form' className={`${styles.editor_header_back} font_body_l_b`}>
          <span className='material-symbols-sharp' aria-hidden='true'>
            arrow_back
          </span>
          양식 선택하기
        </Link>
      </div>

      <div className={styles.editor_header_title}>
        <span className={`${styles.editor_header_title_label} font_h4`}>제목:</span>

        {isEditingTitle ? (
          <input
            type='text'
            className={`${styles.editor_header_title_input} font_h4`}
            value={title}
            onChange={(event) => onChangeTitle(event.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(event) => event.key === 'Enter' && setIsEditingTitle(false)}
            placeholder='이름을 입력해주세요'
            aria-label='문서 제목'
            autoFocus
          />
        ) : (
          <button
            type='button'
            className={`${styles.editor_header_title_value} font_h4`}
            onClick={() => setIsEditingTitle(true)}
          >
            {title || '이름을 입력해주세요'}
          </button>
        )}
      </div>

      <div className={styles.editor_header_tools}>
        <div className={styles.editor_header_history}>
          <button
            type='button'
            className={styles.editor_header_history_btn}
            disabled={!history?.canUndo}
            onClick={() => editor?.chain().focus().undo().run()}
            aria-label='실행 취소'
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              undo
            </span>
          </button>
          <button
            type='button'
            className={styles.editor_header_history_btn}
            disabled={!history?.canRedo}
            onClick={() => editor?.chain().focus().redo().run()}
            aria-label='다시 실행'
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              redo
            </span>
          </button>
        </div>

        <span className={styles.editor_header_divider} aria-hidden='true' />

        <div className={styles.editor_header_actions}>
          <button
            type='button'
            className={styles.editor_header_print}
            aria-label='인쇄'
            {...exportProps}
            onClick={guard(handlePrint)}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              print
            </span>
          </button>

          <button
            key={blinkKey}
            type='button'
            className={`${styles.editor_header_save} ${
              isBlinking ? styles.editor_header_save_blink : ''
            } font_body_m_b`}
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? '저장 중…' : '내 문서함에 저장'}
          </button>

          <button
            type='button'
            className={`${styles.editor_header_download} font_body_m_b`}
            {...exportProps}
            disabled={isDownloading}
            onClick={guard(() => onDownload?.())}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              {isDownloading ? 'hourglass_top' : 'download'}
            </span>
            {isDownloading ? '만드는 중…' : '다운로드'}
          </button>

          {!canExport && (
            <p
              className={`${styles.editor_header_tip} ${
                isPinned ? styles.editor_header_tip_shown : ''
              } font_body_m_b`}
              role='status'
            >
              먼저 &quot;내 문서함에 저장&quot; 버튼을 누른 후 인쇄 또는 다운로드 할 수 있어요.
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
