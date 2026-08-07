import styles from './HeroStat.module.sass';

export default function HeroStat({ value, label, isAccent = false }) {
  return (
    <div className={styles.hero_stat}>
      <strong className={`${styles.hero_stat_value} ${isAccent ? styles.hero_stat_value_accent : ''} font_h3`}>
        {value}
      </strong>
      <span className={`${styles.hero_stat_label} font_caption_r`}>{label}</span>
    </div>
  );
}
