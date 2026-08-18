import styles from './CategoryBtn.module.sass';

// 양식 분류 필터 버튼
export default function CategoryBtn({ label, count, isActive = false, onClick }) {
  return (
    <button
      type='button'
      className={`${styles.category_btn} ${isActive ? styles.category_btn_active : ''} font_body_m_b`}
      onClick={onClick}
    >
      {label}
      {/* 개수를 아직 못 받았을 때는 숫자를 감춘다 */}
      {count === undefined ? null : (
        <span className={styles.category_btn_count}>{` · ${count}`}</span>
      )}
    </button>
  );
}
