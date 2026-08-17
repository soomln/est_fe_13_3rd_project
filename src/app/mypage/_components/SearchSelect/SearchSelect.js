'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './SearchSelect.module.sass';

const MAX_SUGGESTIONS = 6;

// 글자를 치면 목록에서 걸러 보여주고, 고르면 onSelect 로 넘긴다
export default function SearchSelect({
  options,
  value = '',
  placeholder,
  label,
  clearOnSelect = false,
  hasError = false,
  onSelect,
}) {
  const [text, setText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  // 바깥을 누르면 목록을 닫는다
  useEffect(() => {
    if (!isOpen) return undefined;

    const onDown = (event) => {
      if (!boxRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDown);

    return () => document.removeEventListener('mousedown', onDown);
  }, [isOpen]);

  const keyword = text.trim().toLowerCase();
  const matches = keyword
    ? options.filter((option) => option.label.toLowerCase().includes(keyword)).slice(0, MAX_SUGGESTIONS)
    : [];

  const pick = (option) => {
    onSelect(option);
    setText(clearOnSelect ? '' : option.label);
    setIsOpen(false);
    setCursor(0);
  };

  // 위아래로 옮기고 엔터로 고른다
  const onKeyDown = (event) => {
    // 한글 조합 중에는 무시한다. 안 그러면 조합 중이던 글자가 뒤에 다시 붙는다
    if (event.nativeEvent.isComposing) return;

    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (matches.length === 0) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setCursor((prev) => (prev + step + matches.length) % matches.length);
      setIsOpen(true);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      pick(matches[cursor] ?? matches[0]);
    }
  };

  return (
    <div className={styles.search_select} ref={boxRef}>
      {label && <span className={`${styles.search_select_label} font_body_s_b`}>{label}</span>}

      <input
        type='text'
        className={`${styles.search_select_input} ${hasError ? styles.search_select_error : ''} font_body_m_r`}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setIsOpen(true);
          setCursor(0);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={onKeyDown}
      />

      {isOpen && matches.length > 0 && (
        <ul className={styles.search_select_list}>
          {matches.map((option, index) => (
            <li key={option.value ?? option.label}>
              <button
                type='button'
                className={`${styles.search_select_option} ${
                  index === cursor ? styles.search_select_option_on : ''
                } font_body_m_r`}
                onMouseEnter={() => setCursor(index)}
                onClick={() => pick(option)}
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
