'use client';

import styles from './FormControls.module.sass';

// 폼 셀렉트
export function FormSelect({ value, options, placeholder, onChange }) {
  return (
    <span className={styles.select}>
      <select
        className={`${styles.select_input} font_body_l_r`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value=''>{placeholder}</option>

        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>

      <span className={`material-symbols-rounded ${styles.select_arrow}`} aria-hidden='true'>
        keyboard_arrow_down
      </span>
    </span>
  );
}

// 한 줄 입력
export function FormInput({ value, placeholder, onChange, compact = false }) {
  return (
    <input
      type='text'
      className={`${styles.input} ${compact ? styles.input_compact : ''} font_body_l_r`}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

// 여러 줄 입력
export function FormTextarea({ value, placeholder, onChange, height = 500 }) {
  return (
    <textarea
      className={`${styles.textarea} font_body_l_r`}
      style={{ height: `${height}px` }}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
