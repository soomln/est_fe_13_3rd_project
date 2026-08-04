'use client';

import React from 'react';
import styles from './Footer.module.sass';

const FOOTER_MENUS = [
  {
    title: '서비스',
    items: ['포트폴리오', '면접 준비', '이력서 작성', 'AI 분석', '채용공고'],
  },
  {
    title: '회사',
    items: ['소개', '팀 소개', '채용', '블로그', '파트너'],
  },
  {
    title: '고객지원',
    items: ['공지사항', 'FAQ', '문의하기', '개인정보처리방침', '이용약관'],
  },
];

const Footer = () => {
  const onScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer_wrapper}>
      {/* 1440px 중앙 정렬을 위한 글로벌 컨테이너 */}
      <div className={`container ${styles.footer_container}`}>
        {/* 상단 메인 콘텐츠 (로고, 메뉴, 뉴스레터) */}
        <div className={styles.main_content}>
          {/* 1. 로고 및 소셜 영역 */}
          <div className={styles.logo_group}>
            {/* 임시 로고 대체용 텍스트 (실제 SVG 적용 시 이미지 태그 사용) */}
            <h2 className={styles.logo_temp}>&lt;/&gt; CallBack</h2>
            <p className={styles.logo_desc}>
              개발자 취업 준비의 모든 것.
              <br />
              AI와 함께 더 빠르게, 더 스마트하게.
            </p>
            <div className={styles.social_buttons}>
              <button className={styles.social_icon} aria-label='Github'>
                <img src='/images/icon_github.svg' alt='github' />
              </button>
              <button className={styles.social_icon} aria-label='Twitter'>
                <img src='/images/icon_twitter.svg' alt='twitter' />
              </button>
              <button className={styles.social_icon} aria-label='LinkedIn'>
                <img src='/images/icon_linkedin.svg' alt='linkedin' />
              </button>
              <button className={styles.social_icon} aria-label='Instagram'>
                <img src='/images/icon_instagram.svg' alt='instagram' />
              </button>
            </div>
          </div>

          {/* 2. 메뉴 네비게이션 영역 */}
          <nav className={styles.menus_wrapper}>
            {FOOTER_MENUS.map((menu, index) => (
              <div key={index} className={styles.menu_column}>
                <h4 className={styles.menu_title}>{menu.title}</h4>
                <ul className={styles.menu_list}>
                  {menu.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a href='#' className={styles.menu_item}>
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {/* 3. 뉴스레터 영역 */}
          <div className={styles.newsletter_section}>
            <div className={styles.newsletter_header}>
              <h4 className={styles.newsletter_title}>뉴스레터</h4>
              <p className={styles.newsletter_desc}>최신 취업 정보를 이메일로</p>
            </div>
            <form className={styles.newsletter_form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.input_wrapper}>
                <input
                  type='email'
                  placeholder='이메일 주소'
                  className={styles.email_input}
                  aria-label='이메일 주소 입력'
                />
              </div>
              <button type='submit' className={styles.subscribe_btn}>
                구독하기
              </button>
            </form>
          </div>
        </div>

        {/* 하단 저작권 및 TOP 버튼 영역 */}
        <div className={styles.bottom_bar}>
          <address className={styles.copyright_text}>© 2024 CallBack Inc. All rights reserved.</address>
          <button onClick={onScrollToTop} className={styles.top_btn} aria-label='맨 위로 이동'>
            TOP ^
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
