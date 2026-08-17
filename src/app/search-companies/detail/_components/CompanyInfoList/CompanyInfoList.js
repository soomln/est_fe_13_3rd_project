import styles from './CompanyInfoList.module.sass';

// 2026-08-17 → 2026년 8월 17일
function toKoreanDate(value) {
  if (!value) return '';

  const [year, month, day] = value.slice(0, 10).split('-');

  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

// 기업 기본 정보
export default function CompanyInfoList({ company }) {
  const rows = [
    { label: '설립일', value: toKoreanDate(company.founded) },
    { label: '대표자', value: company.ceo },
    { label: '직원 수', value: company.employees == null ? '' : `${company.employees} 명` },
    { label: '자본금', value: company.capital },
    { label: '평균 연봉', value: company.avgSalary },
    { label: '업종', value: company.industry },
    { label: '본사', value: company.address },
  ];

  return (
    <section className={styles.info}>
      <h2 className='font_h3'>기업 기본 정보</h2>

      <dl className={styles.info_list}>
        {rows.map((row) => (
          <div key={row.label} className={styles.info_row}>
            <dt className='font_caption_r'>{row.label}</dt>
            <dd className='font_caption_r'>{row.value || '-'}</dd>
          </div>
        ))}

        <div className={styles.info_row}>
          <dt className='font_caption_r'>홈페이지</dt>
          <dd className='font_caption_r'>
            {company.homepage ? (
              <a className={styles.info_link} href={company.homepage} target='_blank' rel='noreferrer'>
                {company.homepage}
              </a>
            ) : (
              '-'
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
