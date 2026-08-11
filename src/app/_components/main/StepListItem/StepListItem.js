import styles from './StepListItem.module.sass';

export default function StepListItem({
  number = 1,
  title = '무료 양식으로 시작',
  description = '개발자를 위한 무료 양식을 선택하고 편집',
}) {
  return (
    <div className={styles.item}>
      <span className={`font_body_m_b ${styles.number}`}>{number}</span>

      <div className={styles.text}>
        <p className={`font_caption_b ${styles.title}`}>{title}</p>
        <p className={`font_caption_r ${styles.description}`}>{description}</p>
      </div>
    </div>
  );
}
