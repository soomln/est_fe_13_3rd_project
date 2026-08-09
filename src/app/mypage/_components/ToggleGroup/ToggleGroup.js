'use client';

import { useState } from 'react';

import styles from './ToggleGroup.module.sass';

// 언어 수준처럼 하나만 고르는 버튼 묶음
export default function ToggleGroup({ options, defaultValue, label }) {
  const [selected, setSelected] = useState(defaultValue ?? options[0]);

  return (
    <div className={styles.toggle_group} role='group' aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type='button'
          className={`${styles.toggle_group_btn} ${
            selected === option ? styles.toggle_group_btn_active : ''
          } font_body_m_b`}
          onClick={() => setSelected(option)}
          aria-pressed={selected === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
