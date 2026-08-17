'use client';

import { useEffect, useRef, useState } from 'react';
import { codeToHtml } from 'shiki';

import styles from './CodeBlock.module.sass';

export default function CodeBlock({ block, isEditMode = false, updateBlock, removeBlock }) {
  const timeoutRef = useRef(null);

  const [isCopied, setIsCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    if (isEditMode) return;

    async function highlightCode() {
      try {
        const html = await codeToHtml(block.code ?? '', {
          lang: block.language ?? 'javascript',
          theme: 'github-light',
        });

        setHighlightedCode(html);
      } catch (error) {
        console.error('코드 하이라이팅 실패:', error);
        setHighlightedCode('');
      }
    }

    highlightCode();
  }, [block.code, block.language, isEditMode]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const onChangeFilename = (e) => {
    updateBlock(block.id, {
      filename: e.target.value,
    });
  };

  const onChangeLanguage = (e) => {
    updateBlock(block.id, {
      language: e.target.value,
    });
  };

  const onChangeCode = (e) => {
    updateBlock(block.id, {
      code: e.target.value,
    });
  };

  const onCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(block.code ?? '');

      setIsCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (error) {
      console.error('코드 복사 실패:', error);
    }
  };

  return (
    <div className={styles.code_block}>
      <div className={styles.header}>
        <div className={styles.file_info}>
          {isEditMode ? (
            <input
              type='text'
              value={block.filename ?? ''}
              onChange={onChangeFilename}
              placeholder='파일명 (선택)'
              className={styles.filename_input}
            />
          ) : (
            block.filename && <span className={styles.filename}>{block.filename}</span>
          )}
        </div>

        <div className={styles.actions}>
          {isEditMode ? (
            <select
              value={block.language ?? 'javascript'}
              onChange={onChangeLanguage}
              className={styles.language_select}
            >
              <option value='javascript'>JavaScript</option>
              <option value='typescript'>TypeScript</option>
              <option value='jsx'>JSX</option>
              <option value='tsx'>TSX</option>

              <option value='html'>HTML</option>
              <option value='css'>CSS</option>
              <option value='scss'>SCSS</option>

              <option value='json'>JSON</option>

              <option value='python'>Python</option>
              <option value='java'>Java</option>
              <option value='csharp'>C#</option>
              <option value='cpp'>C++</option>
            </select>
          ) : (
            <span className={styles.language}>{block.language ?? 'javascript'}</span>
          )}

          {isEditMode && removeBlock && (
            <button
              type='button'
              className={styles.remove_btn}
              onClick={() => removeBlock(block.id)}
              aria-label='코드 블록 삭제'
            >
              <span className='material-symbols-rounded'>close</span>
            </button>
          )}
        </div>
      </div>

      {isEditMode ? (
        <textarea
          value={block.code ?? ''}
          onChange={onChangeCode}
          spellCheck={false}
          placeholder='코드를 작성해주세요.'
          className={`${styles.editor}`}
        />
      ) : highlightedCode ? (
        <div
          className={styles.highlighted_code}
          dangerouslySetInnerHTML={{
            __html: highlightedCode,
          }}
        />
      ) : (
        <pre className={styles.fallback_code}>
          <code>{block.code ?? ''}</code>
        </pre>
      )}
    </div>
  );
}
