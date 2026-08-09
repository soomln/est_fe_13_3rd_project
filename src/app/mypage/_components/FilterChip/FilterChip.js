import styles from './FilterChip.module.sass';

// 목록 분류 필터 버튼
export default function FilterChip({ label, isActive = false, onClick }) {
  return (
    <button
      type='button'
      className={`${styles.filter_chip} ${isActive ? styles.filter_chip_active : ''} font_body_m_b`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      {label}
    </button>
  );
}
