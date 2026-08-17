import styles from './RatioList.module.sass';

// 면접 경로 비율 목록
export default function RatioList({ title, ratio }) {
  return (
    <section className={styles.ratio}>
      <h2 className={`${styles.ratio_title} font_h3`}>{title}</h2>

      <dl className={styles.ratio_list}>
        {ratio.map((item) => (
          <div key={item.code} className={`${styles.ratio_row} font_body_m_r`}>
            <dt>{item.label}</dt>
            <dd>{item.value}%</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
