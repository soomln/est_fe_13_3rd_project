'use client';

import { useState } from 'react';

import { FILTER_VISIBLE_COUNT } from '@/app/search-companies/_lib/options';
import styles from './FilterGroup.module.sass';

// 필터 그룹 하나 (라디오 목록 + 더보기)
export default function FilterGroup({ title, name, options, value, onChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleOptions = isExpanded ? options : options.slice(0, FILTER_VISIBLE_COUNT);
  const hasMore = options.length > FILTER_VISIBLE_COUNT;

  return (
    <div className={styles.group}>
      <h3 className={`${styles.group_title} font_h4`}>{title}</h3>

      <div className={styles.group_list}>
        {visibleOptions.map((option) => {
          const isChecked = value === option.code;

          return (
            <label
              key={option.code}
              className={`${styles.group_item} ${isChecked ? styles.group_item_checked : ''} font_body_s_r`}
            >
              <input
                type='radio'
                name={name}
                value={option.code}
                checked={isChecked}
                onChange={() => onChange(option.code)}
              />

              <span className='material-symbols-rounded' aria-hidden='true'>
                brightness_1
              </span>

              {option.label}
            </label>
          );
        })}

        {hasMore && (
          <button
            type='button'
            className={`${styles.group_more} font_body_s_r`}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? '접기  −' : '더보기  +'}
          </button>
        )}
      </div>
    </div>
  );
}
