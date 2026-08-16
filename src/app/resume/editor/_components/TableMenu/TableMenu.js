'use client';

import ToolBtn from '@/app/resume/editor/_components/ToolBtn';
import styles from './TableMenu.module.sass';

// 표 안에 커서가 있을 때만 뜨는 메뉴
export default function TableMenu({ editor, isInTable }) {
  if (!editor || !isInTable) return null;

  const run = (fn) => fn(editor.chain().focus()).run();

  const GROUPS = [
    [
      { icon: 'add_column_left', label: '왼쪽에 열 추가', on: (c) => c.addColumnBefore() },
      { icon: 'add_column_right', label: '오른쪽에 열 추가', on: (c) => c.addColumnAfter() },
      { icon: 'variable_remove', label: '이 열 삭제', on: (c) => c.deleteColumn() },
    ],
    [
      { icon: 'add_row_above', label: '위에 행 추가', on: (c) => c.addRowBefore() },
      { icon: 'add_row_below', label: '아래에 행 추가', on: (c) => c.addRowAfter() },
      { icon: 'playlist_remove', label: '이 행 삭제', on: (c) => c.deleteRow() },
    ],
    [
      { icon: 'cell_merge', label: '칸 합치기', on: (c) => c.mergeCells() },
      { icon: 'splitscreen', label: '합친 칸 나누기', on: (c) => c.splitCell() },
    ],
    [
      { icon: 'table_rows', label: '맨 윗줄을 머리글로', on: (c) => c.toggleHeaderRow() },
      { icon: 'view_column', label: '맨 왼쪽 줄을 머리글로', on: (c) => c.toggleHeaderColumn() },
    ],
    [{ icon: 'delete', label: '표 전체 삭제', on: (c) => c.deleteTable() }],
  ];

  return (
    <div className={styles.table_menu} role='toolbar' aria-label='표 편집'>
      <span className={`${styles.table_menu_title} font_body_m_b`}>표</span>

      {GROUPS.map((group, index) => (
        <div key={index} className={styles.table_menu_group}>
          {group.map((tool) => (
            <ToolBtn
              key={tool.label}
              icon={tool.icon}
              label={tool.label}
              onClick={() => run(tool.on)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
