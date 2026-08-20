'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './SearchBar.module.sass';

// 한 자 칠 때마다 찾으면 서버를 너무 자주 부른다. 잠깐 멈췄을 때 한 번만 보낸다
const DELAY = 250;

// 양식 제목 검색
export default function SearchBar({ keyword = '', onSearch }) {
  const [text, setText] = useState(keyword);

  // 부모가 넘기는 함수는 그릴 때마다 새로 만들어진다. 기다리는 시간이 초기화되지 않게 담아둔다
  const fire = useRef(onSearch);
  useEffect(() => {
    fire.current = onSearch;
  });

  useEffect(() => {
    if (text.trim() === keyword) return undefined;

    const timer = setTimeout(() => fire.current?.(text.trim()), DELAY);
    return () => clearTimeout(timer);
  }, [text, keyword]);

  return (
    <form
      className={styles.search_bar}
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(text.trim());
      }}
      role='search'
    >
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
