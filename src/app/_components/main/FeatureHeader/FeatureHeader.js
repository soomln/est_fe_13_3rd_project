import styles from './FeatureHeader.module.sass';

export default function FeatureHeader({
  icon = 'edit_document',
  title = '이력서·자기소개서 작성',
  description = 'AI와 함께 완벽한 지원서를 지금 완성해보세요 !',
  tone = 'green',
}) {
  return (
    <div className={styles.header}>
      <span className={`material-symbols-rounded ${styles.icon} ${styles[`tone_${tone}`]}`} aria-hidden='true'>
        {icon}
      </span>

      <div className={styles.text}>
        <p className={`font_h3 ${styles.title}`}>{title}</p>
        <p className={`font_body_s_b ${styles.description}`}>{description}</p>
      </div>
    </div>
  );
}
