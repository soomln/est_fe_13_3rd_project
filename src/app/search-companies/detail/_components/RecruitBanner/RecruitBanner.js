import styles from './RecruitBanner.module.sass';

// 채용 공고 배너
export default function RecruitBanner({ companyName, homepage }) {
  return (
    <section className={styles.banner}>
      <div className={styles.banner_text}>
        <p className='font_body_m_b'>
          {companyName}와 함께
          <br />
          미래를 만들어 가세요.
        </p>

        <a
          className={`${styles.banner_link} font_caption_b`}
          href={homepage ?? '#'}
          target='_blank'
          rel='noreferrer'
        >
          채용 공고 보러가기
        </a>
      </div>

      <img className={styles.banner_image} src='/images/search-companies/recruit-banner.png' alt='' />
    </section>
  );
}
