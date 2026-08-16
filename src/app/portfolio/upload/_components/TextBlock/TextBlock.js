'use client';

import { useEffect, useRef, useState } from 'react';

import { EditorContent, useEditor } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import { TextStyleKit } from '@tiptap/extension-text-style';

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
        trailingNode: false,
      }),

      TextStyleKit,

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

        if (event.shiftKey) {
          return false;
        }

        event.preventDefault();

        const currentEditor = editorRef.current;
        if (!currentEditor) return true;

        const { $from } = view.state.selection;
        const node = $from.parent;

        let tag = 'p';
        if (node.type.name === 'heading') {
          tag = `h${node.attrs.level}`;
        }

        const textAlign = node.attrs.textAlign;
        const nextHtml = textAlign ? `<${tag} style="text-align: ${textAlign}"></${tag}>` : `<${tag}></${tag}>`;

        updateBlock?.(block.id, {
          html: currentEditor.getHTML(),
        });

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

  useEffect(() => {
    if (!editor) return;
    if (!shouldFocus) return;

    requestAnimationFrame(() => {
      editor.commands.focus('end');
      onFocusComplete?.();
    });
  }, [editor, shouldFocus, onFocusComplete]);

  if (!editor) return null;

  const normalizeUrl = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue.includes('.')) {
      return null;
    }

    const url = /^https?:\/\//i.test(trimmedValue) ? trimmedValue : `https://${trimmedValue}`;

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        return null;
      }

      return parsedUrl.href;
    } catch {
      return null;
    }
  };

  const handleLink = () => {
    let { from, to } = editor.state.selection;

    if (editor.isActive('link')) {
      editor.chain().extendMarkRange('link').run();

      from = editor.state.selection.from;
      to = editor.state.selection.to;
    }

    const previousUrl = editor.getAttributes('link').href ?? '';

    const inputUrl = window.prompt('URL을 입력해주세요.', previousUrl);

    if (inputUrl === null) return;

    const chain = editor.chain().focus().setTextSelection({ from, to });

    if (inputUrl.trim() === '') {
      chain.unsetLink().run();
      return;
    }

    const url = normalizeUrl(inputUrl);
    if (!url) {
      alert('올바른 URL을 입력해주세요.\n예: https://callback.com');
      return;
    }

    chain
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
      {isEditMode && isFocused && (
        <div className={styles.toolbar}>
          {/* 텍스트 스타일 */}
          <div className={styles.toolbar_group}>
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

            <label className={styles.color_btn} aria-label='글자 색상'>
              <span className='material-symbols-sharp'>format_color_text</span>

              <input
                type='color'
                value={editor.getAttributes('textStyle').color || '#000000'}
                onChange={(e) => {
                  editor.chain().focus().setColor(e.target.value).run();
                }}
              />
            </label>
          </div>

          {/* 정렬 */}
          <div className={styles.toolbar_group}>
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
          </div>

          {/* 리스트 / 토글 */}
          <div className={styles.toolbar_group}>
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
          </div>

          {/* 제목 */}
          <div className={styles.toolbar_group}>
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
        </div>
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
