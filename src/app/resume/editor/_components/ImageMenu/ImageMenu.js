'use client';

import { useState } from 'react';

import ToolBtn from '@/app/resume/editor/_components/ToolBtn';
import styles from './ImageMenu.module.sass';

const MIN = 20;
const MAX = 2000;


// 이미지에 커서가 있을 때만 뜨는 메뉴
export default function ImageMenu({ editor, isOnImage }) {
  const [draft, setDraft] = useState(null);

  if (!editor || !isOnImage) return null;

  // 화면에서 재면 한 박자 늦는다. 원본 크기와 넣어 둔 너비로 계산한다
  const shown = editor.view.dom.querySelector('.ProseMirror-selectednode img');
  const natural = { width: shown?.naturalWidth ?? 0, height: shown?.naturalHeight ?? 0 };
  const ratio = natural.width ? natural.height / natural.width : 0;

  const width =
    Number(editor.getAttributes('image').width) ||
    Math.min(natural.width, editor.view.dom.clientWidth);
  const size = { width, height: ratio ? Math.round(width * ratio) : 0 };

  // 비율은 항상 유지한다. 높이를 넣으면 그 높이가 되도록 너비를 계산한다
  const apply = (key, value) => {
    const asked = Math.min(MAX, Math.max(MIN, value));
    const width = key === 'width' ? asked : Math.round(asked / (ratio || 1));

    setDraft(null);
    // 다시 골라 주지 않으면 선택이 풀려서 이 메뉴가 사라진다
    const pos = editor.state.selection.from;
    editor.chain().updateAttributes('image', { width }).setNodeSelection(pos).run();
  };

  const field = (key, label) => (
    <label className={`${styles.image_menu_field} font_body_s_b`}>
      {label}
      <input
        type='text'
        inputMode='numeric'
        className={`${styles.image_menu_input} font_body_s_r`}
        value={draft?.key === key ? draft.value : size[key] || ''}
        onChange={(event) =>
          setDraft({ key, value: event.target.value.replace(/\D/g, '').slice(0, 4) })
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
        onBlur={() => {
          if (draft?.key !== key) return;
          const value = Number(draft.value);
          if (value) apply(key, value);
          else setDraft(null);
        }}
      />
    </label>
  );

  return (
    <div className={styles.image_menu} role='toolbar' aria-label='이미지 편집'>
      <span className={`${styles.image_menu_title} font_body_m_b`}>이미지</span>

      <div className={styles.image_menu_group}>
        {field('width', '너비')}
        {field('height', '높이')}
        <span className={`${styles.image_menu_unit} font_body_s_r`}>px</span>
      </div>


      <div className={styles.image_menu_group}>
        <ToolBtn
          icon='undo'
          label='원래 크기로'
          onClick={() => {
            const pos = editor.state.selection.from;
            editor.chain().updateAttributes('image', { width: null }).setNodeSelection(pos).run();
          }}
        />
        <ToolBtn
          icon='delete'
          label='이미지 삭제'
          onClick={() => editor.chain().focus().deleteSelection().run()}
        />
      </div>
    </div>
  );
}
