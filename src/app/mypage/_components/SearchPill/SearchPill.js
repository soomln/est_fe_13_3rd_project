'use client';

import styles from './SearchPill.module.sass';

// 알약 모양 검색창 + 검색 버튼
export default function SearchPill({ placeholder = '검색어를 입력해주세요', onSearch }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(new FormData(event.currentTarget).get('keyword').trim());
  };

  return (
    <form className={styles.search_pill} onSubmit={handleSubmit} role='search'>
      <div className={styles.search_pill_field}>
        <span className='material-symbols-sharp' aria-hidden='true'>
          search
        </span>
        <input
          type='search'
          name='keyword'
          className={`${styles.search_pill_input} font_body_m_r`}
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </div>

      <button type='submit' className={`${styles.search_pill_btn} font_body_m_b`}>
        검색
      </button>
    </form>
  );
}
