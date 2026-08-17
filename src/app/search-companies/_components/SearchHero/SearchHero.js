'use client';

import styles from './SearchHero.module.sass';

// 기업 탐색 히어로. 검색바 + 추천 검색어
export default function SearchHero({ keyword, onKeywordChange, onSubmit, recommendedKeywords, onRecommendedClick }) {
  return (
    <section className={styles.hero}>
      <h1 className={`${styles.hero_title} font_h1`}>
        어떤 <span className={styles.hero_point}>회사</span>가 궁금 하신가요?
      </h1>

      <form className={styles.hero_search} onSubmit={onSubmit}>
        <input
          type='text'
          className={`${styles.hero_input} font_body_s_r`}
          placeholder='회사명을 검색해 보세요. (ex 네이버, 토스)'
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          aria-label='회사명 검색'
        />

        <button type='submit' className={styles.hero_submit} aria-label='검색'>
          <span className='material-symbols-rounded' aria-hidden='true'>
            search
          </span>
        </button>
      </form>

      <div className={styles.hero_recommend}>
        <p className='font_body_s_b'>추천 검색어</p>

        <div className={styles.hero_tags}>
          {recommendedKeywords.map((item) => (
            <button
              key={item}
              type='button'
              className={`${styles.hero_tag} font_body_s_b`}
              onClick={() => onRecommendedClick(item)}
            >
              # {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
