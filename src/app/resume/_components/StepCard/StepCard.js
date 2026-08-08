import styles from './StepCard.module.sass';

// 히어로 우측 STEP 카드
export default function StepCard({ step, title, desc, icon, tone = 'green', isActive = false }) {
  return (
    <div className={`${styles.step_card} ${styles[`step_card_${tone}`]} ${isActive ? styles.step_card_active : ''}`}>
      <div className={styles.step_card_main}>
        <span className={styles.step_card_icon} aria-hidden='true'>
          {icon}
        </span>
        <div className={styles.step_card_body}>
          <p className={`${styles.step_card_step} font_caption_b`}>{step}</p>
          <p className={`${styles.step_card_title} font_body_m_b`}>{title}</p>
          <p className={`${styles.step_card_desc} font_caption_r`}>{desc}</p>
        </div>
      </div>
      <span className={`${styles.step_card_check} material-symbols-sharp`} aria-hidden='true'>
        {isActive ? 'check_circle' : 'check'}
      </span>
    </div>
  );
}
