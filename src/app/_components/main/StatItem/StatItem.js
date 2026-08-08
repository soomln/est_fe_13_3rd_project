import styles from './StatItem.module.sass';

export default function StatItem({ icon, value, label }) {
  return (
    <div className={styles.stat_item}>
      <span className={`material-symbols-rounded ${styles.stat_icon}`} aria-hidden='true'>
        {icon}
      </span>
      <span className={`font_body_s_b ${styles.stat_label}`}>{label}</span>
      <span className={`font_h4 ${styles.stat_value}`}>{value}</span>
    </div>
  );
}
