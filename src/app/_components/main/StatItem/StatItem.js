import styles from './StatItem.module.sass';

export default function StatItem({ icon, value, label, tone = 'green' }) {
  return (
    <div className={styles.stat_item}>
      <div className={styles.stat_top}>
        <span className={`material-symbols-rounded ${styles.stat_icon} ${styles[`tone_${tone}`]}`} aria-hidden='true'>
          {icon}
        </span>
        <span className={`font_caption_r ${styles.stat_label}`}>{label}</span>
      </div>
      <span className={`font_body_s_b ${styles.stat_value}`}>{value}</span>
    </div>
  );
}
