import styles from './CategoryChip.module.sass';

/**
 * [공통] 카테고리 탭/칩 컴포넌트
 */
export default function CategoryChip({ label = 'web', isSelected = false, onClick = () => {} }) {
  return (
    <button
      type='button'
      className={`${styles.category_chip} ${isSelected ? styles.is_selected : ''}`}
      onClick={onClick}
    >
      <span className={styles.label_text}>{label}</span>
      <span className={styles.active_line} />
    </button>
  );
}
