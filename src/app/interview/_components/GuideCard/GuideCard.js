import styles from './GuideCard.module.sass';

export default function GuideCard({
  icon,
  title,
  description,
}) {
  return (
    <article className={styles.guide_card}>
      <span className={`material-symbols-rounded ${styles.guide_icon}`}>
        {icon}
      </span>

      <h3 className="font_body_m_b">
        {title}
      </h3>

      <p className="font_body_s_r">
        {description}
      </p>
    </article>
  );
}