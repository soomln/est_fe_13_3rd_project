import styles from './QuickBtns.module.sass';

export default function QuickBtnGroup({}) {
  return (
    <div className={styles.btns}>
      <button className={styles.btn}>
        <span className={`${styles.icon} material-symbols-outlined`}>filter_alt</span>
        <span className={`${styles.text} font_body_m_b`}>필터</span>
      </button>
      <button className={styles.btn}>
        <span className={`${styles.icon} material-symbols-outlined`}>add</span>
        <span className={`${styles.text} font_body_m_b`}>업로드</span>
      </button>
      <button className={styles.btn}>
        <span className={`${styles.icon} material-symbols-outlined`}>arrow_upward</span>
        <span className={`${styles.text} font_body_m_b`}>이동</span>
      </button>
    </div>
  );
}
