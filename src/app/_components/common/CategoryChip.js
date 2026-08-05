import styles from './CategoryChip.module.sass';

export default function CategoryChip({ label, isSelected = false, onClick }) {
  return (
    <button
      type='button'
      className={`${styles.category_chip} ${isSelected ? styles.is_selected : ''}`.trim()}
      onClick={onClick}
    >
      <span className={`${styles.label_text} ${isSelected ? 'font_body_m_b' : 'font_body_m_r'}`}>{label}</span>
      <div className={styles.active_line} />
    </button>
  );
}
