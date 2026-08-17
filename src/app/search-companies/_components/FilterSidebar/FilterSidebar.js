'use client';

import FilterGroup from '@/app/search-companies/_components/FilterGroup';
import styles from './FilterSidebar.module.sass';

// 기업 탐색 필터 사이드바
export default function FilterSidebar({ groups, values, onChange, onReset }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar_head}>
        <h2 className='font_h3'>필터</h2>

        <button type='button' className={`${styles.sidebar_reset} font_body_s_r`} onClick={onReset}>
          초기화
        </button>
      </div>

      {groups.map((group) => (
        <FilterGroup
          key={group.key}
          title={group.title}
          name={group.key}
          options={group.options}
          value={values[group.key]}
          onChange={(code) => onChange(group.key, code)}
        />
      ))}
    </aside>
  );
}
