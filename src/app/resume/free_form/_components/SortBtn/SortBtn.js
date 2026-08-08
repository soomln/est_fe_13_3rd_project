'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './SortBtn.module.sass';

// 정렬 드롭다운
export default function SortBtn({ value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const current = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className={styles.sort_btn} ref={rootRef}>
      <button
        type='button'
        className={`${styles.sort_btn_toggle} font_body_m_b`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
      >
        {current.label}
        <span className={`material-symbols-sharp ${styles.sort_btn_arrow}`} aria-hidden='true'>
          change_history
        </span>
      </button>

      {isOpen && (
        <ul className={styles.sort_btn_list} role='listbox' aria-label='정렬 기준'>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type='button'
                role='option'
                aria-selected={option.value === value}
                className={`${styles.sort_btn_option} ${
                  option.value === value ? styles.sort_btn_option_active : ''
                } font_body_m_r`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
