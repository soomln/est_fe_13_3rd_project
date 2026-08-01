'use client';

import styles from './CategoryChip.module.sass';

/**
 * [공통] 카테고리 칩/태그 컴포넌트
 *
 * @param {string} label - 칩에 표시될 텍스트
 * @param {boolean} isActive - 활성화/선택 여부 (Boolean 컨벤션: is)
 * @param {Function} onClick - 클릭 이벤트 핸들러 (이벤트 컨벤션: on)
 */
export default function CategoryChip({ label = '', isActive = false, onClick = () => {} }) {
  return (
    <button type='button' className={`${styles.category_chip} ${isActive ? styles.is_active : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}
