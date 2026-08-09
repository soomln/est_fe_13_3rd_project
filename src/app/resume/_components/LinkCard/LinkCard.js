import Link from 'next/link';

import styles from './LinkCard.module.sass';

// 다음 여정 안내 카드
export default function LinkCard({ tone, icon, label, title, desc, btnLabel, btnHref, children }) {
  return (
    <li className={`${styles.link_card} ${styles[`link_card_${tone}`]}`}>
      <div className={styles.link_card_head}>
        <span className={styles.link_card_icon} aria-hidden='true'>
          {icon}
        </span>
        <Link href={btnHref} className={`${styles.link_card_btn} font_body_m_b`}>
          {btnLabel}
          <span className='material-symbols-sharp' aria-hidden='true'>
            arrow_forward
          </span>
        </Link>
      </div>

      <div className={styles.link_card_text}>
        <div className={styles.link_card_heading}>
          <p className={`${styles.link_card_label} font_caption_b`}>{label}</p>
          <p className={`${styles.link_card_title} font_h4`}>{title}</p>
        </div>
        <p className={`${styles.link_card_desc} font_body_m_b`}>{desc}</p>
      </div>

      {children && <div className={styles.link_card_mockup}>{children}</div>}
    </li>
  );
}
