'use client';

import { useState } from 'react';

import ToolBtn from '@/app/resume/editor/_components/ToolBtn';
import { FONTS } from '@/app/resume/editor/_lib/editorFonts';
import styles from './FontTools.module.sass';

const MIN_SIZE = 8;
const MAX_SIZE = 96;

// 글꼴 고르기와 글자 크기
export default function FontTools({ font, size, onChangeFont, onChangeSize }) {
  // 칸에 치는 동안에는 적용하지 않는다. 엔터나 칸을 벗어날 때 적용한다
  const [draft, setDraft] = useState(null);

  const apply = (next) => {
    setDraft(null);
    onChangeSize(Math.min(MAX_SIZE, Math.max(MIN_SIZE, next)));
  };

  return (
    <>
      <div className={styles.font_tools_select}>
        <select
          className={`${styles.font_tools_select_field} font_body_l_r`}
          value={font}
          onChange={(event) => onChangeFont(event.target.value)}
          aria-label='글꼴'
        >
          {FONTS.map((item) => (
            <option key={item.label} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <span className='material-symbols-sharp' aria-hidden='true'>
          arrow_drop_down
        </span>
      </div>

      <div className={styles.font_tools_size_group}>
        <ToolBtn icon='remove' label='글자 작게' onClick={() => apply(size - 1)} />

        <input
          type='text'
          inputMode='numeric'
          className={`${styles.font_tools_size} font_body_l_r`}
          value={draft ?? size}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, '').slice(0, 2))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          onBlur={() => {
            if (draft === null) return;
            const next = Number(draft);
            if (next) apply(next);
            else setDraft(null);
          }}
          aria-label='글자 크기'
        />

        <ToolBtn icon='add' label='글자 크게' onClick={() => apply(size + 1)} />
      </div>
    </>
  );
}
