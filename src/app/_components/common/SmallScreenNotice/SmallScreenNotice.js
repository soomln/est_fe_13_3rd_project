import Link from 'next/link';

import Hero from '@/app/_components/common/SmallScreenNotice/Hero';
import FeatureSection from '@/app/_components/common/SmallScreenNotice/FeatureSection';
import CopyUrlBtn from '@/app/_components/common/SmallScreenNotice/CopyUrlBtn';
import styles from './SmallScreenNotice.module.sass';

const FEATURES = [
  {
    tone: 'green',
    icon: 'draw',
    tag: '이력서·자기소개서',
    mock: 'resume',
    title: (
      <>
        빈 화면 앞에서
        <br />
        막막하지 않게
      </>
    ),
    desc: '양식을 고르면 브라우저에서 바로 편집할 수 있어요. 문장이 어색하면 AI에게 다듬어 달라고 하면 됩니다. 무엇을 써야 할지 막힐 때도 AI와 함께 처음부터 써 내려갈 수 있어요.',
  },
  {
    tone: 'amber',
    icon: 'record_voice_over',
    tag: 'AI 면접 연습',
    mock: 'interview',
    title: (
      <>
        면접장에 가기 전에
        <br />
        수십 번 연습하기
      </>
    ),
    desc: 'AI가 질문하고, 답변에 바로 피드백을 줍니다. 어디를 고치면 좋을지 알려주니 혼자 연습해도 늘어요. 마음에 드는 질문은 스크랩해두고 다시 볼 수 있어요.',
  },
  {
    tone: 'purple',
    icon: 'folder',
    tag: '포트폴리오',
    mock: 'portfolio',
    title: (
      <>
        만든 것을
        <br />
        제대로 보여주기
      </>
    ),
    desc: '작업물을 올려 내 포트폴리오를 공개해보세요. 다른 사람 포트폴리오를 구경하다 마음에 들면 스크랩해둘 수 있고, 잘 만든 포트폴리오는 팀 프로젝트나 채용 제안으로 이어지기도 합니다.',
  },
  {
    tone: 'blue',
    icon: 'apartment',
    tag: '기업 탐색',
    mock: 'companies',
    title: (
      <>
        가고 싶은 회사,
        <br />
        먼저 다녀온 사람에게
      </>
    ),
    desc: '연봉과 복지 같은 기본 정보부터 실제 면접 후기와 질문 족보까지 모여 있어요. 어떤 질문이 나올지 알고 가면 준비가 달라집니다.',
  },
];

// 1280px 미만에서 실제 화면 대신 보여주는 안내
export default function SmallScreenNotice() {
  return (
    <div className={styles.notice_page}>
      <header className={styles.head}>
        <Link href='/' className={styles.head_home}>
          <img src='/logo.svg' alt='CallBack 홈으로' className={styles.head_logo} />
        </Link>
      </header>

      <div className={styles.guide}>
        <p className={`${styles.guide_title} font_body_m_b`}>
          <span className='material-symbols-rounded'>desktop_windows</span>
          지금은 PC에서만 만날 수 있어요
        </p>
        <p className={`${styles.guide_desc} font_caption_r`}>
          작은 화면에서도 쓸 수 있는 CallBack을 만들고 있어요
        </p>
      </div>

      <Hero />

      {FEATURES.map((feature) => (
        <FeatureSection key={feature.tone} {...feature} />
      ))}

      <section className={styles.cta}>
        <span className={`material-symbols-rounded ${styles.cta_icon}`}>desktop_windows</span>
        <h2 className={`${styles.cta_title} font_h3`}>이제 PC에서 시작해볼까요?</h2>
        <p className={`${styles.cta_desc} font_body_m_r`}>
          주소를 복사해서 PC 브라우저에 붙여넣으면 돼요
        </p>
        <CopyUrlBtn />
      </section>

      <footer className={styles.foot}>
        <img src='/logo.svg' alt='' className={styles.foot_logo} />
        <p className={`${styles.foot_text} font_caption_r`}>
          개발자 취업 준비의 모든 것.
          <br />© 2026 CallBack Inc.
        </p>
      </footer>
    </div>
  );
}
