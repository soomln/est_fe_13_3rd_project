'use client';

import { useEffect, useState } from 'react';

import styles from './NoticePopup.module.sass';

const STORAGE_KEY = 'callback_notice_hide_until';

const NOTICE = {
  title: '[이스트캠프] 오르미 프론트엔드 개발',
  period: '2026.07.15 ~ 2026.08.21',
  features:
    'Next.js App Router, React, SASS Modules, Supabase Auth·DB·Storage, Swiper.js, 반응형 웹, Figma 기반 UI 구현',
  repoUrl: 'https://github.com/soomln/est_fe_13_3rd_project',
  pages: '메인페이지, 이력서·자소서, 포트폴리오 갤러리, AI 면접 연습, 기업 탐색, 마이페이지, 로그인/회원가입',
  team: [
    {
      role: '팀장',
      name: '장도담',
      email: 'jang98dd@gmail.com',
      planning: ['이력서·자소서', '마이페이지', '로그인·회원가입'],
      build: ['백엔드', '이력서·자소서', '마이페이지', '로그인·회원가입', '기업 탐색 UI'],
    },
    {
      role: '서기',
      name: '김소영',
      email: 'qnfehr948@gmail.com',
      planning: ['기업 탐색', 'AI 면접 코칭'],
      build: ['AI 면접 코칭'],
    },
    {
      role: '올라운더',
      name: '박소영',
      email: 'b00v0429@gmail.com',
      planning: ['포트폴리오', '모든 페이지 집중 서포트'],
      build: ['포트폴리오', '공통컴포넌트', '모든 페이지 집중 서포트'],
    },
    {
      role: '팀원',
      name: '송주윤',
      email: 'hwangdo701@gmail.com',
      planning: ['마이페이지 서포트'],
      build: ['기업 탐색 마크업·기능'],
    },
    {
      role: 'GIT관리자',
      name: '최수민',
      email: 'qnfehr948@gmail.com',
      planning: ['메인', '헤더·푸터'],
      build: ['메인', '헤더·푸터·공통컴포넌트'],
    },
  ],
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function NoticePopup() {
  const [open, setOpen] = useState(false);
  const [hideToday, setHideToday] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) !== todayKey()) setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    if (hideToday) window.localStorage.setItem(STORAGE_KEY, todayKey());
    setOpen(false);
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={styles.dialog} role='dialog' aria-modal='true' aria-label='공지사항'>
        <span className={`font_caption_b ${styles.badge}`}>NOTICE</span>

        <h2 className={`font_h3 ${styles.title}`}>{NOTICE.title}</h2>

        <div className={styles.fields}>
          <div className={styles.field}>
            <p className={`font_body_m_b ${styles.label}`}>제작 기간</p>
            <p className={`font_body_m_r ${styles.value}`}>{NOTICE.period}</p>
          </div>

          <div className={styles.field}>
            <p className={`font_body_m_b ${styles.label}`}>주요 특징</p>
            <p className={`font_body_m_r ${styles.value}`}>{NOTICE.features}</p>
          </div>

          <div className={styles.field}>
            <p className={`font_body_m_b ${styles.label}`}>소스 관리</p>
            <a href={NOTICE.repoUrl} target='_blank' rel='noreferrer' className={`font_body_m_r ${styles.link}`}>
              GitHub
            </a>
          </div>

          <div className={styles.field}>
            <p className={`font_body_m_b ${styles.label}`}>구현 완료 페이지</p>
            <p className={`font_body_m_r ${styles.value}`}>{NOTICE.pages}</p>
          </div>

          <div className={styles.field}>
            <p className={`font_body_m_b ${styles.label}`}>팀 구성 및 담당</p>
            <div className={styles.team_list}>
              {NOTICE.team.map((member) => (
                <div key={member.name} className={styles.team_member}>
                  <p className={`font_body_m_b ${styles.team_name}`}>
                    <span className={styles.team_role}>{member.role}</span>
                    {member.name}
                    <span className={`font_body_s_b ${styles.team_email}`}>{member.email}</span>
                  </p>
                  <p className={`font_body_s_r ${styles.team_detail}`}>
                    <span className='font_body_s_b'>기획·디자인 :</span> {member.planning.join(', ')}
                  </p>
                  <p className={`font_body_s_r ${styles.team_detail}`}>
                    <span className='font_body_s_b'>구현 :</span> {member.build.join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footerRow}>
          <label className={`font_body_s_r ${styles.checkboxLabel}`}>
            <input type='checkbox' checked={hideToday} onChange={(e) => setHideToday(e.target.checked)} />
            오늘 하루 안 보기
          </label>

          <button type='button' className={`font_body_s_b ${styles.closeButton}`} onClick={handleClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
