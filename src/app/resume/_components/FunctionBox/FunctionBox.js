import styles from './FunctionBox.module.sass';

// 기능 안내 상자
export default function FunctionBox({ label }) {
  return (
    <li className={styles.function_box}>
      <span className={styles.function_box_icon}>
        <span className='material-symbols-sharp' aria-hidden='true'>
          check
        </span>
      </span>
      <p className={`${styles.function_box_label} font_body_s_b`}>{label}</p>
    </li>
  );
}
