import styles from './QaListItem.module.sass';

export default function QaListItem({ label = 'Q', question = '자기소개를 간단히 해주세요.', tone = 'amber' }) {
  return (
    <div className={styles.item}>
      <span className={`font_body_m_b ${styles.badge} ${styles[`tone_${tone}`]}`}>{label}</span>
      <p className={`font_caption_b ${styles.question}`}>{question}</p>
    </div>
  );
}
