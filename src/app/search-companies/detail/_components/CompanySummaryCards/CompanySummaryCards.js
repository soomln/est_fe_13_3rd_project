import styles from './CompanySummaryCards.module.sass';

// 기업 상세 요약 지표 카드 5개
export default function CompanySummaryCards({ company }) {
  const cards = [
    { label: '면접 채용', value: company?.hire ?? '상시 채용', unit: '' },
    { label: '평균 난이도', value: company?.difficulty ?? '-', unit: '/ 5.0' },
    { label: '관심 기업 등록', value: company?.favorite ?? 0, unit: '건' },
    { label: '전체 후기', value: company?.review ?? 0, unit: '개' },
    { label: '족보', value: company?.jokbo ?? 0, unit: '개' },
  ];

  return (
    <dl className={styles.summary}>
      {cards.map((card) => (
        <div key={card.label} className={styles.summary_card}>
          <dt className='font_body_m_b'>{card.label}</dt>
          <dd className={styles.summary_value}>
            <span className='font_h2'>{card.value}</span>
            {card.unit && <span className={`${styles.summary_unit} font_body_m_b`}>{card.unit}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
