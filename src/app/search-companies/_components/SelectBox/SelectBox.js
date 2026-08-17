'use client';

import styles from './SelectBox.module.sass';

// 목록 상단 필터 셀렉트
export default function SelectBox({ label, value, options, onChange }) {
  return (
    <label className={styles.select}>
      <select className={`${styles.select_input} font_body_s_r`} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value=''>{label}</option>

        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>

      <span className={`material-symbols-rounded ${styles.select_arrow}`} aria-hidden='true'>
        keyboard_arrow_down
      </span>
    </label>
  );
}
