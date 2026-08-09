'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './SortPill.module.sass';

// 알약 모양 정렬 드롭다운
export default function SortPill({ options, value, onChange }) {
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

  return (
    <div className={styles.sort_pill} ref={rootRef}>
      <button
        type='button'
        className={`${styles.sort_pill_toggle} font_body_s_b`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup='listbox'
        aria-expanded={isOpen}
      >
        {value}
        <span className='material-symbols-sharp' aria-hidden='true'>
          arrow_drop_down
        </span>
      </button>

      {isOpen && (
        <ul className={styles.sort_pill_list} role='listbox' aria-label='정렬 기준'>
          {options.map((option) => (
            <li key={option}>
              <button
                type='button'
                role='option'
                aria-selected={option === value}
                className={`${styles.sort_pill_option} ${
                  option === value ? styles.sort_pill_option_active : ''
                } font_body_s_b`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
