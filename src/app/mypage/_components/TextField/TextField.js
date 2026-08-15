import styles from './TextField.module.sass';

// 라벨 + 입력칸. options 를 주면 select, rows 를 주면 textarea 가 된다
// 라벨을 생략할 때는 호출하는 쪽에서 aria-label 을 넘긴다
export default function TextField({ label, options, rows, hasError = false, errorText, ...rest }) {
  const control = `${styles.text_field_control} ${hasError ? styles.text_field_error : ''}`;
  return (
    <label className={styles.text_field}>
      {label && <span className={`${styles.text_field_label} font_body_s_b`}>{label}</span>}

      {options && (
        <span className={styles.text_field_select_wrap}>
          <select className={`${control} font_body_m_r`} {...rest}>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className='material-symbols-sharp' aria-hidden='true'>
            arrow_drop_down
          </span>
        </span>
      )}

      {!options && rows && (
        <textarea
          className={`${styles.text_field_area} ${hasError ? styles.text_field_error : ''} font_body_m_r`}
          rows={rows}
          {...rest}
        />
      )}

      {!options && !rows && (
        <input type='text' className={`${control} font_body_m_r`} {...rest} />
      )}

      {errorText && (
        <span className={`${styles.text_field_message} font_body_s_b`} role='alert'>
          {errorText}
        </span>
      )}
    </label>
  );
}
