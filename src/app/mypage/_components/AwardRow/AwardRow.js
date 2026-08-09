import styles from './AwardRow.module.sass';

export default function AwardRow({ rank, title, date }) {
  return (
    <div className={styles.award_row}>
      <span className={`${styles.award_row_rank} font_body_s_b`}>{rank}</span>

      <div className={styles.award_row_text}>
        <span className={`${styles.award_row_title} font_body_m_b`}>{title}</span>
        <span className={`${styles.award_row_date} font_body_s_b`}>{date}</span>
      </div>
    </div>
  );
}
