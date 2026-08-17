import styles from './MetaLegend.module.sass';

// 카드에 쓰인 아이콘 의미를 설명하는 범례
const LEGEND_ITEMS = [
  { icon: 'account_circle', value: '프론트엔드', label: '직무' },
  { icon: 'calendar_month', value: '2026.07.30', label: '등록일' },
  { icon: 'bookmark', value: '북마크', label: '저장' },
];

export default function MetaLegend() {
  return (
    <div className={styles.legend}>
      <div className={styles.legend_inner}>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className={styles.legend_item}>
            <span className={`material-symbols-rounded ${styles.legend_icon}`} aria-hidden='true'>
              {item.icon}
            </span>

            <span className={`${styles.legend_value} font_body_m_r`}>{item.value}</span>
            <span className={`${styles.legend_label} font_body_m_r`}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
