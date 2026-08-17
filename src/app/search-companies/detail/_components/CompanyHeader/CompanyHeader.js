import styles from './CompanyHeader.module.sass';

// 기업 상세 상단 브랜드 카드
export default function CompanyHeader({ company }) {
  const industry = [company?.industry, company?.size].filter(Boolean).join(' · ');

  const stats = [
    { label: '전체 후기', value: company ? `${company.review ?? 0}개` : '-' },
    { label: '평균 난이도', value: company?.difficulty ? `${company.difficulty} / 5.0` : '-' },
    { label: '합격률', value: company?.passrate == null ? '-' : `${company.passrate}%` },
  ];

  return (
    <section className={styles.brand}>
      <div className={styles.brand_company}>
        <div className={styles.brand_logo}>
          {company?.logo && <img src={company.logo} alt={`${company.name} 로고`} />}
        </div>

        <div className={styles.brand_info}>
          <p className={`${styles.brand_name} font_body_m_b`}>{company?.name ?? ''}</p>
          <p className={`${styles.brand_industry} font_caption_r`}>{industry}</p>

          <div className={styles.brand_tags}>
            {(company?.tags ?? []).map((tag) => (
              <span key={tag} className={`${styles.brand_tag} font_caption_b`}>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <dl className={styles.brand_stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.brand_stat}>
            <dt className='font_caption_r'>{stat.label}</dt>
            <dd className='font_caption_r'>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
