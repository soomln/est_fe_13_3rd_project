import styles from './LogoItem.module.sass';

// 기술 스택 · 관심 회사 공통. 로고가 없으면 앞 두 글자로 대체한다
export default function LogoItem({ label, logoUrl, onRemove }) {
  return (
    <li className={styles.logo_item}>
      {onRemove && (
        <button
          type='button'
          className={styles.logo_item_remove}
          onClick={onRemove}
          aria-label={`${label} 삭제`}
        >
          <span className='material-symbols-sharp' aria-hidden='true'>
            remove
          </span>
        </button>
      )}

      <span className={styles.logo_item_box}>
        {logoUrl ? (
          <img src={logoUrl} alt='' className={styles.logo_item_img} />
        ) : (
          <span className={`${styles.logo_item_initial} font_body_m_b`} aria-hidden='true'>
            {label.slice(0, 2)}
          </span>
        )}
      </span>

      <span className={`${styles.logo_item_label} font_body_s_b`}>{label}</span>
    </li>
  );
}
