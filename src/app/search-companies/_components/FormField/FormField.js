import styles from './FormField.module.sass';

// 폼 라벨 + 입력. inline 이면 라벨이 왼쪽, 아니면 위쪽
export default function FormField({ label, inline = false, children }) {
  return (
    <div className={`${styles.field} ${inline ? styles.field_inline : ''}`}>
      <span className={`${styles.field_label} font_body_l_b`}>{label}</span>
      {children}
    </div>
  );
}
