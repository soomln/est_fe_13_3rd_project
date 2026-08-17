import { formatDate } from '@/utils/formatDate';
import styles from './CompanyNews.module.sass';

// 기업 뉴스
export default function CompanyNews({ news }) {
  if (news.length === 0) return null;

  return (
    <section className={styles.news}>
      <h2 className={`${styles.news_title} font_body_m_b`}>기업 뉴스</h2>

      <ul className={styles.news_list}>
        {news.map((item) => (
          <li key={item.title} className={styles.news_item}>
            {item.url ? (
              <a className={`${styles.news_link} font_caption_r`} href={item.url} target='_blank' rel='noreferrer'>
                {item.title}
              </a>
            ) : (
              <p className={`${styles.news_link} font_caption_r`}>{item.title}</p>
            )}

            <p className={`${styles.news_date} font_caption_r`}>{formatDate(item.date)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
