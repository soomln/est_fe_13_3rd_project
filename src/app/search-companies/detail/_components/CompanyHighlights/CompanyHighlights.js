import styles from './CompanyHighlights.module.sass';

// 기업 한눈에 보기
export default function CompanyHighlights({ summary }) {
  if (summary.length === 0) return null;

  return (
    <section className={styles.highlights}>
      <h2 className={`${styles.highlights_title} font_h4`}>기업 한눈에 보기</h2>

      <ul className={styles.highlights_list}>
        {summary.map((item) => (
          <li key={item.description} className={`${styles.highlights_item} font_caption_r`}>
            <span className='material-symbols-rounded' aria-hidden='true'>
              {item.icon}
            </span>

            {item.description}
          </li>
        ))}
      </ul>
    </section>
  );
}
