import styles from './DifficultyGauge.module.sass';

// 면접 난이도 게이지 (0~5)
export default function DifficultyGauge({ score, grade, max = 5 }) {
  const percent = Math.min(100, Math.max(0, (score / max) * 100));

  return (
    <section className={styles.gauge}>
      <h2 className={`${styles.gauge_title} font_h3`}>면접 난이도</h2>

      <p className={`${styles.gauge_score} font_h2`}>{score}</p>
      <p className={`${styles.gauge_grade} font_body_m_r`}>{grade}</p>

      <div className={styles.gauge_bar_area}>
        <div className={`${styles.gauge_labels} font_body_m_b`}>
          <span>쉬움</span>
          <span>어려움</span>
        </div>

        <div className={styles.gauge_track}>
          <div className={styles.gauge_fill} style={{ width: `${percent}%` }} />
        </div>

        <div className={`${styles.gauge_labels} font_body_m_b`}>
          <span>0</span>
          <span>{max}</span>
        </div>
      </div>
    </section>
  );
}
