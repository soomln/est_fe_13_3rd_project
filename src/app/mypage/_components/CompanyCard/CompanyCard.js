import styles from './CompanyCard.module.sass';

// 스크랩한 기업 카드. 호버하면 로고 대신 지표가 나온다
export default function CompanyCard({ company }) {
  const { name, industry, logoUrl, avgSalary, rating, employeeCount, reviewCount, qbankCount } = company;

  return (
    <div className={styles.company_card}>
      <div className={styles.company_card_logo}>
        {logoUrl ? <img src={logoUrl} alt='' /> : <span className={styles.company_card_logo_dummy} />}
      </div>

      <div className={styles.company_card_name}>
        <p className={`${styles.company_card_title} font_body_l_b`}>{name}</p>
        <p className={`${styles.company_card_industry} font_body_s_b`}>{industry}</p>
      </div>

      <dl className={styles.company_card_stats}>
        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>평균 연봉</dt>
          <dd className='font_body_m_r'>{avgSalary}</dd>
        </div>

        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>기업 평점</dt>
          <dd className={`${styles.company_card_rating} font_body_m_r`}>
            <span className='material-symbols-sharp' aria-hidden='true'>
              star
            </span>
            {rating}
          </dd>
        </div>

        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>사원 수</dt>
          <dd className='font_body_m_r'>{employeeCount}</dd>
        </div>

        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>후기</dt>
          <dd className='font_body_m_r'>{reviewCount}</dd>
        </div>

        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>족보</dt>
          <dd className='font_body_m_r'>{qbankCount}</dd>
        </div>
      </dl>
    </div>
  );
}
