import styles from './QuickBtns.module.sass';

import Link from 'next/link';

export default function QuickBtnGroup({ onMoveTop }) {
  return (
    <div className={styles.btns}>
      <button className={styles.btn}>
        <span className={`${styles.icon} material-symbols-outlined`}>filter_alt</span>
        <span className={`${styles.text} font_body_m_b`}>필터</span>
      </button>
      <button className={styles.btn}>
        <span className={`${styles.icon} material-symbols-outlined`}>add</span>
        <Link href='/portfolio/upload' className={`${styles.text} font_body_m_b`}>
          업로드
        </Link>
      </button>
      <button className={styles.btn} onClick={onMoveTop}>
        <span className={`${styles.icon} material-symbols-outlined`}>arrow_upward</span>
        <span className={`${styles.text} font_body_m_b`}>이동</span>
      </button>
    </div>
  );
}
