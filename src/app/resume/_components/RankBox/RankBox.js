import styles from './RankBox.module.sass';

// AI 도움 항목 순위 행
export default function RankBox({ rank, label, levelText, tone = 'normal' }) {
  return (
    <li className={`${styles.rank_box} ${styles[`rank_box_${tone}`]}`}>
      <span className={`${styles.rank_box_no} font_caption_b`}>{rank}</span>

      <div className={styles.rank_box_body}>
        <p className={`${styles.rank_box_label} font_body_m_b`}>{label}</p>
        <span className={styles.rank_box_track}>
          <span className={`${styles.rank_box_fill} ${styles[`rank_box_fill_${rank}`]}`} />
        </span>
      </div>

      <span className={`${styles.rank_box_level} font_body_s_b`}>{levelText}</span>
    </li>
  );
}
