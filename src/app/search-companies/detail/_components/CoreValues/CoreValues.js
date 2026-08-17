import styles from './CoreValues.module.sass';

// 핵심 가치
export default function CoreValues({ values }) {
  if (values.length === 0) return null;

  return (
    <section className={styles.values}>
      <h2 className={`${styles.values_title} font_h3`}>핵심 가치</h2>

      <ul className={styles.values_list}>
        {values.map((value) => (
          <li key={value.title} className={styles.values_card}>
            <span className={`material-symbols-rounded ${styles.values_icon}`} aria-hidden='true'>
              {value.icon}
            </span>

            <p className={`${styles.values_name} font_body_m_b`}>{value.title}</p>
            <p className={`${styles.values_desc} font_caption_r`}>{value.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
