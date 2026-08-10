'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './TextBlock.module.sass';

export default function TextBlock({ block, updateBlock, removeBlock }) {
  const blockRef = useRef(null);
  const editorRef = useRef(null);
  const savedRangeRef = useRef(null);

  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    editorRef.current.innerHTML = block.content ?? '';
  }, []);

  const saveSelection = () => {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (!editorRef.current?.contains(range.commonAncestorContainer)) {
      return;
    }

    savedRangeRef.current = range.cloneRange();
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;

    if (!selection || !range) return false;

    editorRef.current?.focus();

    selection.removeAllRanges();
    selection.addRange(range);

    return true;
  };

  const applyCommand = (command, value = null) => {
    if (!restoreSelection()) return;

    document.execCommand(command, false, value);

    saveSelection();
  };

  const handleBold = () => {
    applyCommand('bold');
  };

  const handleUnderline = () => {
    applyCommand('underline');
  };

  const handleAlignLeft = () => {
    applyCommand('justifyLeft');
  };

  const handleAlignCenter = () => {
    applyCommand('justifyCenter');
  };

  const handleAlignRight = () => {
    applyCommand('justifyRight');
  };

  const handleLink = () => {
    const url = window.prompt('URL을 입력해주세요.');

    if (!url) return;

    applyCommand('createLink', url);
  };

  const handleFontSize = (e) => {
    applyCommand('fontSize', e.target.value);
  };

  const handleBlur = (e) => {
    const nextFocusedElement = e.relatedTarget;

    if (nextFocusedElement && blockRef.current?.contains(nextFocusedElement)) {
      return;
    }

    setIsFocused(false);

    updateBlock(block.id, {
      content: editorRef.current?.innerHTML ?? '',
    });
  };

  return (
    <div ref={blockRef} className={styles.block} onBlur={handleBlur}>
      {isFocused && (
        <div className={styles.toolbar}>
          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              handleBold();
            }}
            aria-label='굵게'
          >
            <span className='material-symbols-outlined'>format_bold</span>
          </button>

          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              handleUnderline();
            }}
            aria-label='밑줄'
          >
            <span className='material-symbols-outlined'>format_underlined</span>
          </button>

          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              handleAlignLeft();
            }}
            aria-label='왼쪽 정렬'
          >
            <span className='material-symbols-outlined'>format_align_left</span>
          </button>

          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              handleAlignCenter();
            }}
            aria-label='가운데 정렬'
          >
            <span className='material-symbols-outlined'>format_align_center</span>
          </button>

          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              handleAlignRight();
            }}
            aria-label='오른쪽 정렬'
          >
            <span className='material-symbols-outlined'>format_align_right</span>
          </button>

          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              handleLink();
            }}
            aria-label='링크'
          >
            <span className='material-symbols-outlined'>link</span>
          </button>

          <select
            className='font_body_s_r'
            defaultValue='3'
            onMouseDown={saveSelection}
            onChange={handleFontSize}
            aria-label='글자 크기'
          >
            <option className='font_body_s_r' value='1'>
              10pt
            </option>
            <option className='font_body_s_r' value='2'>
              12pt
            </option>
            <option className='font_body_s_r' value='3'>
              14pt
            </option>
            <option className='font_body_s_r' value='4'>
              18pt
            </option>
            <option className='font_body_s_r' value='5'>
              24pt
            </option>
            <option className='font_body_s_r' value='6'>
              32pt
            </option>
          </select>

          <button
            type='button'
            onMouseDown={(e) => {
              e.preventDefault();
              removeBlock(block.id);
            }}
            aria-label='삭제'
          >
            <span className='material-symbols-outlined'>delete</span>
          </button>
        </div>
      )}

      <div className={styles.editor_wrapper}>
        <div
          ref={editorRef}
          className={styles.editor}
          contentEditable
          suppressContentEditableWarning
          data-placeholder='여기에 텍스트 입력...'
          onFocus={() => setIsFocused(true)}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
        />
      </div>
    </div>
  );
}
