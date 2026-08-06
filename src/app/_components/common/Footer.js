'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.sass';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footer_inner}>
        <div className={styles.footer_content}>
          <div className={styles.brand_info}>
            <Image src='/logo.svg' alt='CallBack 로고' width={140} height={28} />
            <p className={`${styles.brand_desc} font_body_m_r`}>
              개발자 취업 준비의 모든 것.
              <br />
              AI와 함께 더 빠르게, 더 스마트하게.
            </p>
            {/* SNS 아이콘 링크 (원본 그대로 생략 없이) */}
            <div className={styles.sns_links}>
              <a href='#' aria-label='GitHub'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22'></path>
                </svg>
              </a>
              <a href='#' aria-label='Twitter'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z'></path>
                </svg>
              </a>
              <a href='#' aria-label='LinkedIn'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z'></path>
                  <rect x='2' y='9' width='4' height='12'></rect>
                  <circle cx='4' cy='4' r='2'></circle>
                </svg>
              </a>
              <a href='#' aria-label='Instagram'>
                <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <rect x='2' y='2' width='20' height='20' rx='5' ry='5'></rect>
                  <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z'></path>
                  <line x1='17.5' y1='6.5' x2='17.51' y2='6.5'></line>
                </svg>
              </a>
            </div>
          </div>

          <div className={styles.link_group_container}>
            <div className={styles.link_column}>
              <h4 className='font_body_l_b'>서비스</h4>
              <Link href='/portfolio' className='font_body_m_r'>
                포트폴리오
              </Link>
              <Link href='/interview' className='font_body_m_r'>
                면접 준비
              </Link>
              <Link href='/resume' className='font_body_m_r'>
                이력서 작성
              </Link>
              <Link href='#' className='font_body_m_r'>
                AI 분석
              </Link>
              <Link href='#' className='font_body_m_r'>
                채용공고
              </Link>
            </div>

            <div className={styles.link_column}>
              <h4 className='font_body_l_b'>회사</h4>
              <Link href='#' className='font_body_m_r'>
                소개
              </Link>
              <Link href='#' className='font_body_m_r'>
                팀 소개
              </Link>
              <Link href='#' className='font_body_m_r'>
                채용
              </Link>
              <Link href='#' className='font_body_m_r'>
                블로그
              </Link>
              <Link href='#' className='font_body_m_r'>
                파트너
              </Link>
            </div>

            <div className={styles.link_column}>
              <h4 className='font_body_l_b'>고객지원</h4>
              <Link href='#' className='font_body_m_r'>
                공지사항
              </Link>
              <Link href='#' className='font_body_m_r'>
                FAQ
              </Link>
              <Link href='#' className='font_body_m_r'>
                문의하기
              </Link>
              <Link href='#' className='font_body_m_r'>
                개인정보처리
              </Link>
              <Link href='#' className='font_body_m_r'>
                이용약관
              </Link>
            </div>
          </div>

          <div className={styles.newsletter_area}>
            <h4 className='font_body_l_b'>뉴스레터</h4>
            <p className='font_body_s_r'>최신 취업 정보를 이메일로</p>
            <div className={styles.input_box}>
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='#6F6F6F' strokeWidth='2'>
                <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'></path>
                <polyline points='22,6 12,13 2,6'></polyline>
              </svg>
              <input type='email' placeholder='이메일 주소' className='font_body_s_r' />
            </div>
            <button className={`${styles.btn_subscribe} font_body_s_b`}>구독하기</button>
          </div>
        </div>

        <div className={styles.footer_bottom}>
          <p className={`${styles.copyright} font_caption_r`}>© 2024 CallBack Inc. All rights reserved.</p>
          <button className={`${styles.btn_top} font_body_s_b`} onClick={handleScrollToTop}>
            TOP <span>↑</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
