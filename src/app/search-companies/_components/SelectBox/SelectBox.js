'use client';

import styles from './SelectBox.module.sass';

// 목록 상단 필터 셀렉트. label 을 주면 '선택 안 함' 옵션이 맨 위에 붙는다
export default function SelectBox({ label, value, options, onChange }) {
  return (
    <label className={styles.select}>
      <select className={`${styles.select_input} font_body_s_r`} value={value} onChange={(event) => onChange(event.target.value)}>
        {label && <option value=''>{label}</option>}

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
