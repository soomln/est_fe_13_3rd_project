'use client';

import { useState } from 'react';

import styles from './InterestChip.module.sass';

// 관심 분야 선택 칩
export default function InterestChip({ label, defaultSelected = false }) {
  const [isSelected, setIsSelected] = useState(defaultSelected);

  return (
    <button
      type='button'
      className={`${styles.interest_chip} ${
        isSelected ? styles.interest_chip_selected : ''
      } font_body_m_b`}
      onClick={() => setIsSelected((prev) => !prev)}
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
