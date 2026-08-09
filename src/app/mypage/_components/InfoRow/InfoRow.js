import styles from './InfoRow.module.sass';

// 학력 · 경력 · 언어 공통 행
export default function InfoRow({ title, sub, meta, badge, badgeTone = 'green' }) {
  return (
    <div className={styles.info_row}>
      <div className={styles.info_row_left}>
        <span className={`${styles.info_row_title} font_body_l_b`}>{title}</span>
        <span className={styles.info_row_divider} aria-hidden='true' />
        <span className={`${styles.info_row_sub} font_body_m_r`}>{sub}</span>
      </div>

      <div className={styles.info_row_right}>
        {meta && <span className={`${styles.info_row_meta} font_body_s_b`}>{meta}</span>}
        {badge && (
          <span className={`${styles[`info_row_badge_${badgeTone}`]} font_body_s_b`}>{badge}</span>
        )}
      </div>
    </div>
  );
}
