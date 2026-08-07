import styles from './StepCard.module.sass';

export default function StepCard({ step, title, desc, icon, isActive = false }) {
  return (
    <div className={`${styles.step_card} ${isActive ? styles.step_card_active : ''}`}>
      <span className={styles.step_card_icon} aria-hidden='true'>
        {icon}
      </span>
      <div className={styles.step_card_body}>
        <p className={`${styles.step_card_step} font_caption_b`}>{step}</p>
        <p className={`${styles.step_card_title} font_body_m_b`}>{title}</p>
        <p className={`${styles.step_card_desc} font_caption_r`}>{desc}</p>
      </div>
      <span className={`${styles.step_card_check} material-symbols-rounded`} aria-hidden='true'>
        {isActive ? 'check_circle' : 'check'}
      </span>
    </div>
  );
}
