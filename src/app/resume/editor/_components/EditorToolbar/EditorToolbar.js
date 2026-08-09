'use client';

import { Fragment, useState } from 'react';

import AiToolMenu from '@/app/resume/editor/_components/AiToolMenu';
import ToolBtn from '@/app/resume/editor/_components/ToolBtn';
import styles from './EditorToolbar.module.sass';

const FONTS = ['맑은 고딕', '굴림', '바탕', '돋움'];

const TOOL_GROUPS = [
  [
    { icon: 'format_color_text', label: '글자 색' },
    { icon: 'border_color', label: '형광펜' },
  ],
  [
    { icon: 'format_bold', label: '굵게' },
    { icon: 'format_italic', label: '기울임' },
    { icon: 'format_underlined', label: '밑줄' },
    { icon: 'strikethrough_s', label: '취소선' },
  ],
  [
    { icon: 'format_align_left', label: '왼쪽 정렬' },
    { icon: 'format_align_center', label: '가운데 정렬' },
    { icon: 'format_align_right', label: '오른쪽 정렬' },
    { icon: 'format_align_justify', label: '양쪽 정렬' },
    { icon: 'format_list_numbered', label: '번호 목록' },
    { icon: 'format_list_bulleted', label: '글머리 목록' },
  ],
  [
    { icon: 'link', label: '링크' },
    { icon: 'imagesmode', label: '이미지' },
    { icon: 'table', label: '표' },
  ],
];

export default function EditorToolbar() {
  const [font, setFont] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState('16');
  const [activeTools, setActiveTools] = useState([]);

  const toggleTool = (icon) => {
    setActiveTools((prev) =>
      prev.includes(icon) ? prev.filter((item) => item !== icon) : [...prev, icon]
    );
  };

  return (
    <div className={styles.toolbar}>
      <AiToolMenu />

      <div className={styles.toolbar_inner}>
        <div className={styles.toolbar_select}>
          <select
            className={`${styles.toolbar_select_field} font_body_l_r`}
            value={font}
            onChange={(event) => setFont(event.target.value)}
            aria-label='글꼴'
          >
            {FONTS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <span className='material-symbols-sharp' aria-hidden='true'>
            arrow_drop_down
          </span>
        </div>

        <div className={styles.toolbar_size_group}>
          <ToolBtn
            icon='remove'
            label='글자 작게'
            onClick={() => setFontSize((prev) => String(Math.max(8, Number(prev) - 1)))}
          />

          <input
            type='text'
            inputMode='numeric'
            className={`${styles.toolbar_size} font_body_l_r`}
            value={fontSize}
            onChange={(event) => setFontSize(event.target.value.replace(/\D/g, ''))}
            aria-label='글자 크기'
          />

          <ToolBtn
            icon='add'
            label='글자 크게'
            onClick={() => setFontSize((prev) => String(Math.min(96, Number(prev) + 1)))}
          />
        </div>

        {TOOL_GROUPS.map((group, index) => (
          <Fragment key={index}>
            <span className={styles.toolbar_divider} aria-hidden='true' />

            {group.map((tool) => (
              <ToolBtn
                key={tool.icon}
                icon={tool.icon}
                label={tool.label}
                isActive={activeTools.includes(tool.icon)}
                onClick={() => toggleTool(tool.icon)}
              />
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
