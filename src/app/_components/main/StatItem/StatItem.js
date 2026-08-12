import Image from 'next/image';
import styles from './StatItem.module.sass';

export default function StatItem({ iconSrc, value, label, tone = 'green' }) {
  return (
    <div className={styles.stat_item}>
      <div className={styles.stat_top}>
        <span className={`${styles.stat_icon} ${styles[`tone_${tone}`]}`}>
          <Image src={iconSrc} alt='' width={14} height={14} />
        </span>
        <span className={`font_caption_r ${styles.stat_label}`}>{label}</span>
      </div>
      <span className={`font_body_s_b ${styles.stat_value}`}>{value}</span>
    </div>
  );
}
