import styles from './Tag.module.sass';

/**
 * [공통] 초록색 안내 태그 / 뱃지 컴포넌트
 *
 * @param {string} label
 * @param {string} variant
 */
export default function Tag({ label, variant }) {
  return <span className={`${styles.tag} ${styles[variant]}`}>{label}</span>;
}
