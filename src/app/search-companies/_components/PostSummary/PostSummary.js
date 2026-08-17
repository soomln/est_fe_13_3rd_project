import styles from './PostSummary.module.sass';

// 면접 총평. 후기는 지표 1개 + 한 줄 요약, 족보는 지표 4개
export default function PostSummary({ items, description }) {
  return (
    <section className={styles.summary}>
      <h2 className={`${styles.summary_title} font_h2`}>면접 총평</h2>

      <div className={`${styles.summary_box} ${description ? styles.summary_box_with_desc : ''}`}>
        {items.map((item) => (
          <div key={item.label} className={styles.summary_item}>
            {item.icon && (
              <span className={`material-symbols-rounded ${styles.summary_icon}`} aria-hidden='true'>
                {item.icon}
              </span>
            )}

            <div className={styles.summary_item_text}>
              <p className={`${styles.summary_label} font_body_l_b`}>{item.label}</p>

              <p className={styles.summary_value}>
                <span className={`${styles.summary_score} ${item.muted ? styles.summary_score_muted : ''}`}>
                  {item.value}
                </span>
                {item.unit && <span className={`${styles.summary_unit} font_body_l_r`}>{item.unit}</span>}
              </p>
            </div>
          </div>
        ))}

        {description && <p className={`${styles.summary_desc} font_body_l_r`}>{description}</p>}
      </div>
    </section>
  );
}
