'use client';

import { useRef, useState } from 'react';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';

import styles from './TextBlock.module.sass';

export default function TextBlock({ block, isEditMode, updateBlock, removeBlock }) {
  if (!isEditMode) {
    return (
      <div
        className={styles.viewer}
        dangerouslySetInnerHTML={{
          __html: block.html ?? '',
        }}
      />
    );
  }

  return <TextEditor block={block} updateBlock={updateBlock} removeBlock={removeBlock} />;
}

function TextEditor({ block, updateBlock, removeBlock }) {
  const blockRef = useRef(null);

  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
        },
      }),

      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),

      Placeholder.configure({
        placeholder: '여기에 텍스트 입력...',
      }),

      Details.configure({
        persist: true,
        renderToggleButton: ({ element, isOpen }) => {
          element.innerHTML = `
            <span class="material-symbols-sharp">
              ${isOpen ? 'arrow_drop_down' : 'arrow_right'}
            </span>
          `;

          element.setAttribute('aria-label', isOpen ? '토글 접기' : '토글 펼치기');
        },
      }),

      DetailsSummary,
      DetailsContent,
    ],

    content: block.html ?? '',

    immediatelyRender: false,
  });

  if (!editor) return null;

  const handleLink = () => {
    const previousUrl = editor.getAttributes('link').href ?? '';

    const url = window.prompt('URL을 입력해주세요.', previousUrl);

    if (url === null) return;

    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();

      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: url,
        target: '_blank',
      })
      .run();
  };

  const handleHeadingChange = (e) => {
    const value = e.target.value;

    if (value === 'p') {
      editor.chain().focus().setParagraph().run();

      return;
    }

    const level = Number(value.replace('h', ''));

    editor
      .chain()
      .focus()
      .setHeading({
        level,
      })
      .run();
  };

  const getCurrentTextType = () => {
    if (
      editor.isActive('heading', {
        level: 1,
      })
    ) {
      return 'h1';
    }

    if (
      editor.isActive('heading', {
        level: 2,
      })
    ) {
      return 'h2';
    }

    if (
      editor.isActive('heading', {
        level: 3,
      })
    ) {
      return 'h3';
    }

    return 'p';
  };

  const handleToggle = () => {
    if (editor.isActive('details')) {
      editor.chain().focus().unsetDetails().run();

      return;
    }

    editor.chain().focus().setDetails().run();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    const nextFocusedElement = e.relatedTarget;

    if (nextFocusedElement && blockRef.current?.contains(nextFocusedElement)) {
      return;
    }

    setIsFocused(false);

    updateBlock(block.id, {
      html: editor.getHTML(),
    });
  };

  return (
    <div ref={blockRef} className={styles.block} onFocusCapture={handleFocus} onBlurCapture={handleBlur}>
      {isFocused && (
        <div className={styles.toolbar}>
          {/* 굵게 */}
          <button
            type='button'
            className={editor.isActive('bold') ? styles.active : ''}
            onMouseDown={(e) => {
              e.preventDefault();

              editor.chain().focus().toggleBold().run();
            }}
            aria-label='굵게'
          >
            <span className='material-symbols-sharp'>format_bold</span>
          </button>

          {/* 밑줄 */}
          <button
            type='button'
            className={editor.isActive('underline') ? styles.active : ''}
            onMouseDown={(e) => {
              e.preventDefault();

              editor.chain().focus().toggleUnderline().run();
            }}
            aria-label='밑줄'
          >
            <span className='material-symbols-sharp'>format_underlined</span>
          </button>

          {/* 왼쪽 정렬 */}
          <button
            type='button'
            className={
              editor.isActive({
                textAlign: 'left',
              })
                ? styles.active
                : ''
            }
            onMouseDown={(e) => {
              e.preventDefault();

              editor.chain().focus().setTextAlign('left').run();
            }}
            aria-label='왼쪽 정렬'
          >
            <span className='material-symbols-sharp'>format_align_left</span>
          </button>

          {/* 가운데 정렬 */}
          <button
            type='button'
            className={
              editor.isActive({
                textAlign: 'center',
              })
                ? styles.active
                : ''
            }
            onMouseDown={(e) => {
              e.preventDefault();

              editor.chain().focus().setTextAlign('center').run();
            }}
            aria-label='가운데 정렬'
          >
            <span className='material-symbols-sharp'>format_align_center</span>
          </button>

          {/* 오른쪽 정렬 */}
          <button
            type='button'
            className={
              editor.isActive({
                textAlign: 'right',
              })
                ? styles.active
                : ''
            }
            onMouseDown={(e) => {
              e.preventDefault();

              editor.chain().focus().setTextAlign('right').run();
            }}
            aria-label='오른쪽 정렬'
          >
            <span className='material-symbols-sharp'>format_align_right</span>
          </button>

          {/* 링크 */}
          <button
            type='button'
            className={editor.isActive('link') ? styles.active : ''}
            onMouseDown={(e) => {
              e.preventDefault();

              handleLink();
            }}
            aria-label='링크'
          >
            <span className='material-symbols-sharp'>link</span>
          </button>

          {/* 불릿 리스트 */}
          <button
            type='button'
            className={editor.isActive('bulletList') ? styles.active : ''}
            onMouseDown={(e) => {
              e.preventDefault();

              editor.chain().focus().toggleBulletList().run();
            }}
            aria-label='불릿 리스트'
          >
            <span className='material-symbols-sharp'>format_list_bulleted</span>
          </button>

          {/* 숫자 리스트 */}
          <button
            type='button'
            className={editor.isActive('orderedList') ? styles.active : ''}
            onMouseDown={(e) => {
              e.preventDefault();

              editor.chain().focus().toggleOrderedList().run();
            }}
            aria-label='숫자 리스트'
          >
            <span className='material-symbols-sharp'>format_list_numbered</span>
          </button>

          {/* 토글 */}
          <button
            type='button'
            className={editor.isActive('details') ? styles.active : ''}
            onMouseDown={(e) => {
              e.preventDefault();

              handleToggle();
            }}
            aria-label='토글'
          >
            <span className='material-symbols-sharp'>arrow_drop_down</span>
          </button>

          {/* 본문 / 제목 */}
          <select
            className='font_body_s_r'
            value={getCurrentTextType()}
            onChange={handleHeadingChange}
            aria-label='글자 스타일'
          >
            <option value='p'>본문</option>

            <option value='h1'>제목 1</option>

            <option value='h2'>제목 2</option>

            <option value='h3'>제목 3</option>
          </select>
        </div>
      )}

      <div className={`${styles.editor_wrapper} ${styles.edit_mode}`}>
        <EditorContent editor={editor} className={styles.editor} />

        <button
          type='button'
          className={styles.close_btn}
          onMouseDown={(e) => {
            e.preventDefault();

            removeBlock(block.id);
          }}
          aria-label='삭제'
        >
          <span className='material-symbols-sharp'>close</span>
        </button>
      </div>
    </div>
  );
}
