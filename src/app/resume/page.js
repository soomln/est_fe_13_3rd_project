import { Fragment } from 'react';
import Link from 'next/link';

import styles from './page.module.sass';
import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import StepCard from '@/app/resume/_components/StepCard';
import HeroStat from '@/app/resume/_components/HeroStat';
import TemplateBrowser from '@/app/resume/_components/TemplateBrowser';
import FunctionBox from '@/app/resume/_components/FunctionBox';
import RankBox from '@/app/resume/_components/RankBox';
import LinkCard from '@/app/resume/_components/LinkCard';

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

const AI_RANKS = [
  { rank: 1, label: '💪 나의 장점 · 강점', levelText: '매우 높음', tone: 'top' },
  { rank: 2, label: '🎯 지원 동기', levelText: '높음', tone: 'high' },
  { rank: 3, label: '🔎 나의 단점 · 보완점', levelText: '높음', tone: 'high' },
  { rank: 4, label: '🚀 프로젝트 경험 정리', levelText: '보통', tone: 'normal' },
  { rank: 5, label: '🌱 입사 후 포부', levelText: '보통', tone: 'normal' },
];

// 주의: supabase 연결 전까지 쓰는 임시 목록
const NEXT_PROJECTS = ['프로젝트명', '프로젝트명', '프로젝트명'];

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

        <section className={styles.ai_chat}>
          <div className={`container ${styles.section_inner}`}>
            <div className={styles.section_head}>
              <p className={`${styles.section_label} font_h4`}>STEP 03</p>
              <h2 className={`${styles.section_title} font_h1`}>
                AI와 대화하며 <span className={styles.section_title_point}>나</span>를 알고 완성하기
              </h2>
              <p className={`${styles.section_desc} font_body_m_r`}>
                장단점, 지원동기처럼 쓰기 어려운 항목도 AI 질의응답으로 술술 완성
              </p>
            </div>

            <div className={styles.ai_chat_body}>
              <div className={styles.ai_chat_preview}>
                <img
                  src='/images/resume/ai_chat_image.png'
                  alt='AI 코치와 대화하며 자기소개서를 작성하는 화면'
                  className={styles.ai_chat_img}
                />
              </div>

              <div className={styles.ai_chat_rank}>
                <div className={styles.ai_chat_rank_head}>
                  <span className={styles.ai_chat_rank_icon} aria-hidden='true'>
                    🏆
                  </span>
                  <div className={styles.ai_chat_rank_head_text}>
                    <p className={`${styles.ai_chat_rank_title} font_body_m_b`}>AI가 가장 많이 도와준 항목</p>
                    <p className={`${styles.ai_chat_rank_desc} font_caption_r`}>
                      개발자들이 자소서 작성 시 가장 많이 고민하는 항목이에요
                    </p>
                  </div>
                </div>

                <ul className={styles.ai_chat_rank_list}>
                  {AI_RANKS.map((item) => (
                    <RankBox
                      key={item.rank}
                      rank={item.rank}
                      label={item.label}
                      levelText={item.levelText}
                      tone={item.tone}
                    />
                  ))}
                </ul>

                <p className={`${styles.ai_chat_notice} font_caption_b`}>
                  💡 어려운 항목일수록 AI 코치와 함께라면 더 쉽게 완성할 수 있어요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.next_step}>
          <div className={`container ${styles.section_inner}`}>
            <div className={styles.section_head}>
              <p className={`${styles.section_label} font_body_l_b`}>NEXT STEP</p>
              <h2 className={`${styles.section_title} font_h1`}>서류를 다 썼다면, 이제 다음 여정으로</h2>
              <p className={`${styles.section_desc} font_body_m_r`}>
                작성한 서류는 CallBack의 다른 서비스에서도 자동으로 연결돼요
              </p>
            </div>

            <div className={styles.next_progress}>
              <div className={styles.next_progress_step}>
                <span className={`${styles.next_progress_icon} ${styles.next_progress_icon_done}`}>
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    check
                  </span>
                </span>
                <div className={styles.next_progress_text}>
                  <p className={`${styles.next_progress_label} font_caption_b`}>완료</p>
                  <p className={`${styles.next_progress_title} font_body_s_b`}>취업 서류 작성</p>
                </div>
              </div>

              <span className={`${styles.next_progress_arrow} material-symbols-sharp`} aria-hidden='true'>
                arrow_right_alt
              </span>

              <div className={styles.next_progress_step}>
                <span className={`${styles.next_progress_icon} ${styles.next_progress_icon_next} font_body_l_b`}>2</span>
                <div className={styles.next_progress_text}>
                  <p className={`${styles.next_progress_label_next} font_caption_b`}>다음 단계</p>
                  <p className={`${styles.next_progress_title} font_body_s_b`}>서류로 시작하는 취업 준비</p>
                </div>
              </div>
            </div>

            <ul className={styles.next_links}>
              <LinkCard
                tone='green'
                icon='🎤'
                label='방금 쓴 서류로'
                title='AI 모의 면접 연습'
                btnLabel='면접 연습 시작'
                btnHref='/interview'
                desc={
                  <>
                    방금 쓴 이력서와 자소서를 기반으로
                    <br />
                    <b>실전형 답변 연습</b>을 받아보세요
                  </>
                }
              >
                <div className={styles.next_mock_row}>
                  <span className={`${styles.next_mock_badge} ${styles.next_mock_badge_q}`}>Q</span>
                  <p className={styles.next_mock_text}>어떤 기술 스택을 주로 쓰나요?</p>
                </div>
                <div className={`${styles.next_mock_row} ${styles.next_mock_row_indent}`}>
                  <span className={`${styles.next_mock_badge} ${styles.next_mock_badge_a}`}>A</span>
                  <p className={`${styles.next_mock_text} ${styles.next_mock_text_answer}`}>
                    React + TS, 주로 SPA 아키텍처...
                  </p>
                </div>
                <div className={styles.next_mock_row}>
                  <span className={`${styles.next_mock_badge} ${styles.next_mock_badge_q}`}>Q</span>
                  <p className={styles.next_mock_text}>가장 힘들었던 프로젝트는?</p>
                </div>
              </LinkCard>

              <LinkCard
                tone='amber'
                icon='🎨'
                label='공유하기'
                title='포트폴리오 갤러리'
                btnLabel='갤러리 둘러보기'
                btnHref='/portfolio'
                desc={
                  <>
                    내 포트폴리오를 갤러리에 공개하고,
                    <br />
                    다른 개발자들의 프로젝트에서 <b>영감</b>과 <b>피드백</b>을 받아보세요
                  </>
                }
              />

              <LinkCard
                tone='purple'
                icon='👥'
                label='함께 성장'
                title='팀 매칭 · 커뮤니티'
                btnLabel='팀원 · 정보 찾기'
                btnHref='/community'
                desc={
                  <>
                    스터디 · 사이드 프로젝트 팀원을 찾거나,
                    <br />
                    실제 <b>면접 후기</b>와 <b>기업 정보</b>를 개발자들과 나눠요
                  </>
                }
              >
                {NEXT_PROJECTS.map((name, index) => (
                  <div key={`${name}-${index}`} className={styles.next_mock_project}>
                    <p className={styles.next_mock_project_name}>{name}</p>
                    <span className={styles.next_mock_project_tag}>모집중</span>
                  </div>
                ))}
              </LinkCard>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
