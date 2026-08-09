import styles from './HeroStat.module.sass';

// 히어로 통계 한 칸
export default function HeroStat({ value, label, tone }) {
  return (
    <div className={styles.hero_stat}>
      <strong className={`${styles.hero_stat_value} ${tone ? styles[`hero_stat_value_${tone}`] : ''} font_h3`}>
        {value}
      </strong>
      <span className={`${styles.hero_stat_label} font_body_s_b`}>{label}</span>
    </div>
  );
}
