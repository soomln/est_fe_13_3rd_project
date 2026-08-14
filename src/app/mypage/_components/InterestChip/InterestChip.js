'use client';

import { useState } from 'react';

import styles from './InterestChip.module.sass';

// 관심 분야 선택 칩
// selected 를 넘기면 부모가 상태를 쥐고, 넘기지 않으면 스스로 관리한다
export default function InterestChip({ label, defaultSelected = false, selected, onToggle }) {
  const [inner, setInner] = useState(defaultSelected);
  const isControlled = selected !== undefined;
  const isSelected = isControlled ? selected : inner;

  const handleClick = () => {
    if (!isControlled) setInner((prev) => !prev);
    onToggle?.(label);
  };

  return (
    <button
      type='button'
      className={`${styles.interest_chip} ${
        isSelected ? styles.interest_chip_selected : ''
      } font_body_m_b`}
      onClick={handleClick}
      aria-pressed={isSelected}
    >
      {isSelected && (
        <span className='material-symbols-sharp' aria-hidden='true'>
          check
        </span>
      )}
      {label}
    </button>
  );
}
