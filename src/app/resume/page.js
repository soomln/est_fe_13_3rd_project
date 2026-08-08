import { Fragment } from 'react';
import Link from 'next/link';

import styles from './page.module.sass';
import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import StepCard from '@/app/resume/_components/StepCard';
import HeroStat from '@/app/resume/_components/HeroStat';
import TemplateBrowser from '@/app/resume/_components/TemplateBrowser';
import FunctionBox from '@/app/resume/_components/FunctionBox';

const HERO_STEPS = [
  {
    step: 'STEP 01',
    title: '무료 양식 선택',
    desc: '개발자의 취업을 위한 모든 양식 무료 제공',
    icon: '📋',
    tone: 'green',
  },
  {
    step: 'STEP 02',
    title: '브라우저에서 편집',
    desc: '설치 없이 웹에서 편집 · 저장 · 다운로드',
    icon: '✍️',
    tone: 'blue',
  },
  {
    step: 'STEP 03',
    title: 'AI와 쉽고 빠르게 완성',
    desc: '장단점 · 지원동기 질의응답 통해 완성',
    icon: '🤖',
    tone: 'purple',
    isActive: true,
  },
];

const HERO_STATS = [
  { value: '12+', label: '무료 양식', tone: 'green' },
  { value: 'AI', label: '작성 코칭', tone: 'amber' },
  { value: '8,500+', label: '작성 완료' },
];

// 주의: supabase 연결 전까지 쓰는 임시 목록
const FREE_TEMPLATES = [
  { id: 1, type: '이력서', title: '이력서', downloadCount: 3290 },
  { id: 2, type: '이력서', title: '이력서', downloadCount: 3290 },
  { id: 3, type: '자기소개서', title: '자기소개서', downloadCount: 3290 },
  { id: 4, type: '이력서', title: '이력서', downloadCount: 3290 },
  { id: 5, type: '자기소개서', title: '자기소개서', downloadCount: 3290 },
  { id: 6, type: '이력서', title: '이력서', downloadCount: 3290 },
];

const EDITOR_FUNCTIONS = [
  '설치 없이 브라우저에서 편집',
  'AI에게 물어보며 작성',
  '계정 문서함에 저장 · 관리',
  '저장한 서류 기반 AI 면접 질문 제공',
];

export default function Resume() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={`container ${styles.hero_inner}`}>
            <div className={styles.hero_intro}>
              <span className={`${styles.hero_badge} font_body_s_b`}>무료 양식 · 브라우저 편집 · AI 연습</span>

              <h1 className={`${styles.hero_title} font_title`}>
                쓰기 어려운 취업 서류,
                <br />
                <span className={styles.hero_title_point}>AI</span>와 함께{' '}
                <span className={styles.hero_title_point}>완성</span>하세요.
              </h1>

              <p className={`${styles.hero_desc} font_body_l_r`}>
                무료 이력서 · 자소서 양식부터 브라우저 직접 편집, AI 질의응답까지.
                <br />
                개발자를 위한 취업 서류 작성 도구를 한 곳에서.
              </p>

              <div className={styles.hero_btns}>
                <Link href='/resume/free_form' className={`${styles.hero_btn_primary} font_h4`}>
                  양식 고르고 작성하기
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    arrow_forward
                  </span>
                </Link>
                <Link href='/mypage/documents' className={`${styles.hero_btn_secondary} font_h4`}>
                  내 문서함으로 이동
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className={styles.hero_stats}>
                {HERO_STATS.map((item) => (
                  <HeroStat key={item.label} value={item.value} label={item.label} tone={item.tone} />
                ))}
              </div>
            </div>

            <div className={styles.hero_steps}>
              {HERO_STEPS.map((item, index) => (
                <Fragment key={item.step}>
                  <StepCard
                    step={item.step}
                    title={item.title}
                    desc={item.desc}
                    icon={item.icon}
                    tone={item.tone}
                    isActive={item.isActive}
                  />
                  {index < HERO_STEPS.length - 1 && (
                    <span className={`${styles.hero_step_arrow} material-symbols-sharp`} aria-hidden='true'>
                      change_history
                    </span>
                  )}
                </Fragment>
              ))}

              <div className={styles.hero_progress}>
                <span className={`${styles.hero_progress_text} font_caption_r`}>
                  평균 <strong className='font_caption_b'>40분</strong>이면 서류 하나가 완성돼요!
                </span>
                <span className={`${styles.hero_progress_rate} font_caption_b`}>완성도 100%</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.templates}>
          <div className={`container ${styles.section_inner}`}>
            <div className={styles.section_head}>
              <p className={`${styles.section_label} font_h4`}>STEP 01</p>
              <h2 className={`${styles.section_title} font_h1`}>무료 양식으로 시작하기</h2>
              <p className={`${styles.section_desc} font_body_m_r`}>
                개발자를 위한 무료 이력서·자기소개서 양식을 선택하고 편집해보세요
              </p>
            </div>

            <TemplateBrowser items={FREE_TEMPLATES} />
          </div>
        </section>

        <section className={styles.editor}>
          <div className={`container ${styles.section_inner}`}>
            <div className={styles.section_head}>
              <p className={`${styles.section_label} font_h4`}>STEP 02</p>
              <h2 className={`${styles.section_title} font_h1`}>브라우저에서 바로 편집</h2>
              <p className={`${styles.section_desc} font_body_m_r`}>
                별도 프로그램 설치 없이 웹에서 편집·저장·다운로드 하세요
              </p>
            </div>

            <div className={styles.editor_body}>
              <div className={styles.editor_preview}>
                <img
                  src='/images/resume/editor_image.png'
                  alt='브라우저에서 이력서를 편집하는 화면'
                  className={styles.editor_img}
                />
              </div>

              <ul className={styles.editor_functions}>
                {EDITOR_FUNCTIONS.map((label) => (
                  <FunctionBox key={label} label={label} />
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
