import styles from './LogoItem.module.sass';

// 로고가 없으면 앞 두 글자로 대체한다
export default function LogoItem({ label, logoUrl, icon, onRemove }) {
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
        {icon ? (
          <svg viewBox='0 0 24 24' className={styles.logo_item_icon} aria-hidden='true'>
            <circle cx='12' cy='12' r='12' fill={icon.color} />
            <path d={icon.path} fill='#FFFFFF' transform='translate(5.4 5.4) scale(0.55)' />
          </svg>
        ) : logoUrl ? (
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
