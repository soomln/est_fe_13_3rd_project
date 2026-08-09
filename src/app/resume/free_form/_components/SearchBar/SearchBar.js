'use client';

import { useState } from 'react';

import styles from './SearchBar.module.sass';

// 양식 제목 검색
export default function SearchBar({ keyword = '', onSearch }) {
  const [text, setText] = useState(keyword);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(text.trim());
  };

  return (
    <form className={styles.search_bar} onSubmit={handleSubmit} role='search'>
      <div className={styles.search_bar_field}>
        <span className={`material-symbols-sharp ${styles.search_bar_icon}`} aria-hidden='true'>
          search
        </span>
        <input
          type='search'
          className={`${styles.search_bar_input} font_body_m_r`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder='검색어를 입력해주세요'
          aria-label='양식 검색'
        />
      </div>

      <button type='submit' className={`${styles.search_bar_btn} font_body_m_b`}>
        검색
      </button>
    </form>
  );
}
