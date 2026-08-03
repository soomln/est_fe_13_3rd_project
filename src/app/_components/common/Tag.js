import styles from './Tag.module.sass';

/**
 * [공통] 안내 태그 / 뱃지 컴포넌트
 *
 * @param {string} label
 * @param {string} variant
 */
export default function Tag({ label, variant = 'green' }) {
  return <span className={`${styles.tag} ${styles[variant]} font_body_s_b`.trim()}>{label}</span>;
}
