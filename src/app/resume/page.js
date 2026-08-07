import Link from 'next/link';

import styles from './page.module.sass';
import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import StepCard from '@/app/resume/_components/StepCard';
import HeroStat from '@/app/resume/_components/HeroStat';

const HERO_STEPS = [
  { step: 'STEP 01', title: '무료 양식 선택', desc: '개발자의 취업을 위한 모든 양식', icon: '📋' },
  { step: 'STEP 02', title: '브라우저에서 편집', desc: '설치 없이 웹에서 편집 · 저장 · 다운로드', icon: '✍️' },
  {
    step: 'STEP 03',
    title: 'AI와 쉽고 빠르게 완성',
    desc: '장단점 · 지원동기 질의응답 통해 완성',
    icon: '🤖',
    isActive: true,
  },
];

const HERO_STATS = [
  { value: '12+', label: '무료 양식' },
  { value: 'AI', label: '첨삭 지원', isAccent: true },
  { value: '8,500+', label: '작성 완료' },
];

export default function Resume() {
  return (
    <>
      <Header />
      <main>
        <section className={styles.hero}>
          <div className={`container ${styles.hero_inner}`}>
            <div className={styles.hero_intro}>
              <span className={`${styles.hero_badge} font_body_s_b`}>무료 양식 · 브라우저 편집 · AI 첨삭</span>

              <h1 className={`${styles.hero_title} font_title`}>
                쓰기 어려운 취업 서류,
                <br />
                <span className={styles.hero_title_point}>AI</span>와 함께{' '}
                <span className={styles.hero_title_point}>완성</span>하세요.
              </h1>

              <p className={`${styles.hero_desc} font_body_m_r`}>
                무료 이력서 · 자소서 양식부터 브라우저 직접 편집, AI 질의응답까지.
                <br />
                개발자를 위한 취업 서류 작성 도구를 한 곳에서.
              </p>

              <div className={styles.hero_btns}>
                <Link href='/resume/free_form' className={`${styles.hero_btn_primary} font_body_m_b`}>
                  양식 고르고 작성하기
                  <span className='material-symbols-rounded' aria-hidden='true'>
                    arrow_forward
                  </span>
                </Link>
                <Link href='/mypage/documents' className={`${styles.hero_btn_secondary} font_body_m_b`}>
                  내 문서함으로 이동
                  <span className='material-symbols-rounded' aria-hidden='true'>
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className={styles.hero_stats}>
                {HERO_STATS.map((item) => (
                  <HeroStat key={item.label} value={item.value} label={item.label} isAccent={item.isAccent} />
                ))}
              </div>
            </div>

            <div className={styles.hero_steps}>
              <ul className={styles.hero_step_list}>
                {HERO_STEPS.map((item, index) => (
                  <li key={item.step} className={styles.hero_step_item}>
                    <StepCard
                      step={item.step}
                      title={item.title}
                      desc={item.desc}
                      icon={item.icon}
                      isActive={item.isActive}
                    />
                    {index < HERO_STEPS.length - 1 && (
                      <span className={`${styles.hero_step_arrow} material-symbols-rounded`} aria-hidden='true'>
                        arrow_drop_down
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <div className={styles.hero_progress}>
                <div className={styles.hero_progress_row}>
                  <span className={`${styles.hero_progress_text} font_caption_b`}>
                    평균 40분이면 서류 하나가 완성돼요!
                  </span>
                  <span className={`${styles.hero_progress_rate} font_caption_b`}>진행률 100%</span>
                </div>
                <div className={styles.hero_progress_bar}>
                  <div className={styles.hero_progress_fill} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
