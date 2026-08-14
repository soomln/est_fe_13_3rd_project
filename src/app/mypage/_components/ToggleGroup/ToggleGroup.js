'use client';

import { useState } from 'react';

import styles from './ToggleGroup.module.sass';

// 언어 수준처럼 하나만 고르는 버튼 묶음
// value 를 넘기면 부모가 상태를 쥐고, 넘기지 않으면 스스로 관리한다
export default function ToggleGroup({ options, defaultValue, label, value, onChange }) {
  const [inner, setInner] = useState(defaultValue ?? options[0]);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : inner;

  const setSelected = (option) => {
    if (!isControlled) setInner(option);
    onChange?.(option);
  };

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
