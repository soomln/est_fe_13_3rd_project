import styles from './page.module.sass';
import Image from 'next/image';

import Header from '../_components/common/Header/Header';
import Footer from '../_components/common/Footer/Footer';

import ActionButton from '@/app/interview/_components/ActionButton';
import FeatureCard from '@/app/interview/_components/FeatureCard';
import CompanyCard from '@/app/interview/_components/CompanyCard';
import FaqItem from '@/app/interview/_components/FaqItem';

// 임시 데이터
const dummyCompanies = [
  {
    id: 1,
    logo: '/images/estSoft 1.png',
    companyName: '이스트소프트',
    position: '프론트엔드 개발자',
    salary: '4,500만원',
    rating: 4.2,
  },
  {
    id: 2,
    logo: '/images/estSoft 1.png',
    companyName: '이스트소프트',
    position: '백엔드 개발자',
    salary: '4,800만원',
    rating: 4.0,
  },
  {
    id: 3,
    logo: '/images/estSoft 1.png',
    companyName: '이스트소프트',
    position: 'AI 엔지니어',
    salary: '5,200만원',
    rating: 4.5,
  },
  {
    id: 4,
    logo: '/images/estSoft 1.png',
    companyName: '이스트소프트',
    position: '보안',
    salary: '4,300만원',
    rating: 3.9,
  },
];

const faqList = [
  {
    id: 1,
    question: '자기소개를 해주세요.',
    answer:
      '안녕하세요. 사용자 경험을 중요하게 생각하는 프론트엔드 개발자입니다. React와 TypeScript를 활용한 프로젝트 경험이 있으며, 문제 해결 과정과 협업을 통해 지속적으로 성장하고 있습니다.',
  },
  {
    id: 2,
    question: '지원 동기를 말씀해주세요.',
    answer:
      '회사의 비전과 직무에 매력을 느껴 지원하게 되었습니다. 사용자에게 좋은 경험을 제공하는 서비스를 만드는 것이 목표입니다.',
  },
  {
    id: 3,
    question: '프로젝트에서 어려웠던 점은 무엇인가요?',
    answer:
      'API 응답 구조가 변경되었을 때 컴포넌트를 리팩터링하고 상태 관리를 수정하여 문제를 해결했습니다.',
  },
  {
    id: 4,
    question: '협업 경험을 말씀해주세요.',
    answer:
      'Git Flow를 사용하여 브랜치 전략을 지키며 협업했고, 코드 리뷰를 통해 품질을 개선했습니다.',
  },
  {
    id: 5,
    question: '본인의 장단점을 말씀해주세요.',
    answer:
      '장점은 책임감과 문제 해결 능력이며, 단점은 완벽주의 성향이 있어 일정 관리를 통해 보완하고 있습니다.',
  },
  {
    id: 6,
    question: '마지막으로 하고 싶은 말이 있나요?',
    answer:
      '좋은 기회를 주셔서 감사합니다. 항상 배우는 자세로 성장하는 개발자가 되겠습니다.',
  },
];

export default function InterviewPage() {
  return (
    <>
      <Header />

      <main className={styles.interview_page}>
        <section className={styles.hero_section}>
          <div className="container">
            <div className={styles.hero_content}>

              <div className={styles.hero_left}>
                <div className={styles.hero_title}>
                  <span className="font_body_l_r">
                    오늘도 성장하는 당신을 응원해요.
                  </span>

                  <h1 className="font_subtitle">
                    오늘도 <strong>AI 면접 연습</strong>을
                    <br />
                    시작해볼까요?
                  </h1>
                </div>

                <div className={styles.hero_cards}>
                  <FeatureCard
                    title="이력서 / 자소서 기반 면접 질문 생성"
                    description="작성한 이력서 / 자소서에 맞게 예상 질문을 생성해드려요."
                  />
                  <FeatureCard
                    title="기업 선택 후 맞춤 질문 생성"
                    description="선택한 기업과 직무에 맞는 예상 면접 질문을 AI가 생성해드립니다."
                  />
                  <FeatureCard
                    title="실제 면접 흐름 그대로 진행"
                    description="실전처럼 연습하고, 답변을 피드백 받을 수 있어요."
                  />
                </div>

                <ActionButton text="AI 면접 연습 시작하기" />
              </div>

              <div className={styles.hero_right}>
                <Image
                  src="/images/AIimg.png"
                  alt="AI 면접 로봇"
                  width={650}
                  height={650}
                  className={styles.hero_image}
                  priority
                />
              </div>

            </div>
          </div>
        </section>

        {/* 관심기업 + 자주 묻는 질문 */}
        <div className="container">
          <section className={styles.content_section}>
            <section className={styles.company_section}>
              <div className={styles.company_header}>
                <h2 className="font_h3">
                  ⭐ 나의 관심 기업
                </h2>

                <button
                  type="button"
                  className={`${styles.view_all_btn} font_body_s_r`}
                >
                  전체 보기
                </button>
              </div>

              <div className={styles.company_list}>
                {dummyCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    {...company}
                  />
                ))}
              </div>
            </section>

            <section className={styles.question_section}>
              <h2 className="font_h3">
                ❓ 자주 묻는 면접 질문
              </h2>

              <div className={styles.question_list}>
                {faqList.map((faq) => (
                  <FaqItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                  />
                ))}
              </div>
            </section>
          </section>
        </div>

        {/* 핵심 기능 */}
        <section className='feature_section'></section>

        {/* AI 면접 가이드 */}
        <section className='guide_section'></section>
      </main>

      <Footer />
    </>
  );
}
