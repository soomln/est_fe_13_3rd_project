import styles from './Benefits.module.sass';

// 복지 및 혜택
export default function Benefits({ benefits }) {
  if (benefits.length === 0) return null;

  return (
    <section className={styles.benefits}>
      <h2 className={`${styles.benefits_title} font_h3`}>복지 및 혜택</h2>

      <ul className={styles.benefits_list}>
        {benefits.map((benefit) => (
          <li key={benefit.title} className={styles.benefits_item}>
            <span className={`material-symbols-rounded ${styles.benefits_icon}`} aria-hidden='true'>
              {benefit.icon}
            </span>

            <p className={`${styles.benefits_name} font_caption_b`}>{benefit.title}</p>
            <p className={`${styles.benefits_desc} font_caption_r`}>{benefit.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
