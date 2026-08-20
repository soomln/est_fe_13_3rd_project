'use client';

import React from 'react';
import Image from 'next/image';
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
            <Image src='/logo.svg' alt='CallBack Logo' width={124} height={18} className={styles.logo_img} />
            <p className={`font_body_s_r ${styles.logo_desc}`}>
              개발자 취업 준비의 모든 것.
              <br />
              AI와 함께 더 빠르게, 더 스마트하게.
            </p>
            <div className={styles.social_buttons}>
              <button className={styles.social_icon} aria-label='Github'>
                <Image 
                src='/images/github-icon.svg' 
                alt='github' 
                width={16}
                height={16}
                />
              </button>
              <button className={styles.social_icon} aria-label='Twitter'>
                <Image 
                src='/images/twiter-icon.svg' 
                alt='twitter'  
                width={16}
                height={16}       
                />
              </button>
              <button className={styles.social_icon} aria-label='LinkedIn'>
                <Image 
                src='/images/linkedin-icon.svg' 
                alt='linkedin' 
                width={16}
                height={16}
                />
              </button>
              <button className={styles.social_icon} aria-label='Instagram'>
                <Image 
                src='/images/instagram-icon.svg' 
                alt='instagram' 
                width={16}
                height={16}
                />
              </button>
            </div>
          </div>

          {/* 2. 메뉴 네비게이션 영역 */}
          <nav className={styles.menus_wrapper}>
            {FOOTER_MENUS.map((menu, index) => (
              <div key={index} className={styles.menu_column}>
                <h3 className={`font_body_m_b ${styles.menu_title}`}>{menu.title}</h3>
                <ul className={styles.menu_list}>
                  {menu.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a href='#' className={`font_body_s_r ${styles.menu_item}`}>
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
              <h3 className={`font_body_m_b ${styles.newsletter_title}`}>뉴스레터</h3>
              <p className={`font_body_s_r ${styles.newsletter_desc}`}>최신 취업 정보를 이메일로</p>
            </div>
            <form className={styles.newsletter_form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.input_wrapper}>
                <span className={`material-symbols-sharp ${styles.input_icon}`} aria-hidden='true'>mail</span>
                <input
                  type='email'
                  placeholder='이메일 주소'
                  className={`font_caption_b ${styles.email_input}`}
                  aria-label='이메일 주소 입력'
                />
              </div>
              <button type='submit' className={`font_caption_b ${styles.subscribe_btn}`}>
                구독하기
              </button>
            </form>
          </div>
        </div>

        {/* 하단 저작권 및 TOP 버튼 영역 */}
        <div className={styles.bottom_bar}>
          <address className={`font_caption_b ${styles.copyright_text}`}>© 2024 CallBack Inc. All rights reserved.</address>
          <button onClick={onScrollToTop} className={`font_caption_r ${styles.top_btn}`} aria-label='맨 위로 이동'>
            TOP ^
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
