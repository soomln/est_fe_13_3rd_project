'use client';

import { useEffect, useRef, useState } from 'react';

import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';

import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';

import styles from './TextBlock.module.sass';

export default function TextBlock({
  block,
  isEditMode = false,
  updateBlock,
  removeBlock,
  addBlockAfter,
  shouldFocus = false,
  onFocusComplete,
}) {
  const blockRef = useRef(null);
  const editorRef = useRef(null);

  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: !isEditMode,
        },

        // heading 뒤에 빈 p 자동 생성 방지
        trailingNode: false,
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

    editable: isEditMode,

    immediatelyRender: false,

    editorProps: {
      handleKeyDown: (view, event) => {
        if (!isEditMode) return false;

        if (event.key !== 'Enter') return false;

        // Shift + Enter
        // → 현재 TextBlock 내부에서 줄바꿈
        if (event.shiftKey) {
          return false;
        }

        // Enter
        // → Tiptap 내부에 새 줄을 생성하지 않고
        // 새로운 TextBlock 생성
        event.preventDefault();

        const currentEditor = editorRef.current;

        if (!currentEditor) return true;

        const { $from } = view.state.selection;

        const node = $from.parent;

        let tag = 'p';

        // 현재 heading 스타일 유지
        if (node.type.name === 'heading') {
          tag = `h${node.attrs.level}`;
        }

        // 현재 정렬 유지
        const textAlign = node.attrs.textAlign;

        const nextHtml = textAlign ? `<${tag} style="text-align: ${textAlign}"></${tag}>` : `<${tag}></${tag}>`;

        // 현재 블록 저장
        updateBlock?.(block.id, {
          html: currentEditor.getHTML(),
        });

        // 바로 아래 새 TextBlock 생성
        addBlockAfter?.(block.id, {
          type: 'text',
          html: nextHtml,
        });

        return true;
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Enter로 새로 생성된 TextBlock 자동 포커스
  useEffect(() => {
    if (!editor) return;
    if (!shouldFocus) return;

    requestAnimationFrame(() => {
      editor.commands.focus('end');

      onFocusComplete?.();
    });
  }, [editor, shouldFocus, onFocusComplete]);

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

    editor.chain().focus().setHeading({ level }).run();
  };

  const getCurrentTextType = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';

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
    if (!isEditMode) return;

    setIsFocused(true);
  };

  const handleBlur = (e) => {
    if (!isEditMode) return;

    const nextFocusedElement = e.relatedTarget;

    if (nextFocusedElement && blockRef.current?.contains(nextFocusedElement)) {
      return;
    }

    setIsFocused(false);

    updateBlock?.(block.id, {
      html: editor.getHTML(),
    });
  };

  return (
    <div ref={blockRef} className={styles.block} onFocusCapture={handleFocus} onBlurCapture={handleBlur}>
      {/* 블록 단위 툴바 */}
      {isEditMode && isFocused && (
        <div className={styles.toolbar}>
          {/* 왼쪽 정렬 */}
          <button
            type='button'
            className={editor.isActive({ textAlign: 'left' }) ? styles.active : ''}
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
            className={editor.isActive({ textAlign: 'center' }) ? styles.active : ''}
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
            className={editor.isActive({ textAlign: 'right' }) ? styles.active : ''}
            onMouseDown={(e) => {
              e.preventDefault();

              editor.chain().focus().setTextAlign('right').run();
            }}
            aria-label='오른쪽 정렬'
          >
            <span className='material-symbols-sharp'>format_align_right</span>
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

          {/* 제목 / 본문 */}
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

      {/* 드래그한 텍스트에 적용하는 툴바 */}
      {isEditMode && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor, from, to }) => {
            return editor.isEditable && from !== to;
          }}
        >
          <div className={styles.bubble_toolbar}>
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
          </div>
        </BubbleMenu>
      )}

      <div className={`${styles.editor_wrapper} ${isEditMode ? styles.edit_mode : ''}`}>
        <EditorContent editor={editor} className={styles.editor} />

        {isEditMode && (
          <button
            type='button'
            className={styles.close_btn}
            onMouseDown={(e) => {
              e.preventDefault();

              removeBlock?.(block.id);
            }}
            aria-label='삭제'
          >
            <span className='material-symbols-sharp'>close</span>
          </button>
        )}
      </div>
    </div>
  );
}
