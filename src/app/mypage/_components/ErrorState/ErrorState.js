import Link from 'next/link';

import styles from './ErrorState.module.sass';

// 불러오기 실패·빈 화면. 다시 시도와 홈으로 가기를 함께 준다
export default function ErrorState({
  icon = 'error',
  title = '불러오지 못했어요',
  desc = '잠시 뒤 다시 시도해주세요.',
  reason,
  onRetry,
  children,
}) {
  return (
    <div className={styles.error_state}>
      <span className={`material-symbols-sharp ${styles.error_state_icon}`} aria-hidden='true'>
        {icon}
      </span>

      <p className={`${styles.error_state_title} font_h4`} role='status'>
        {title}
      </p>

      {desc && <p className={`${styles.error_state_desc} font_body_m_r`}>{desc}</p>}
      {reason && <p className={`${styles.error_state_reason} font_body_s_b`}>{reason}</p>}

      <div className={styles.error_state_actions}>
        {children}

        {onRetry && (
          <button
            type='button'
            className={`${styles.error_state_btn} font_body_m_b`}
            onClick={onRetry}
          >
            다시 불러오기
          </button>
        )}

        <Link href='/' className={`${styles.error_state_btn} font_body_m_b`}>
          홈으로
        </Link>
      </div>
    </div>
  );
}
