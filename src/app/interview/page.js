'use client';

import { useRouter } from 'next/navigation';
import styles from './page.module.sass';
import Image from 'next/image';

import Header from '../_components/common/Header/Header';
import Footer from '../_components/common/Footer/Footer';

import ActionButton from '@/app/interview/_components/ActionButton';
import FeatureCard from '@/app/interview/_components/FeatureCard';
import CompanyCard from '@/app/interview/_components/CompanyCard';
import FaqItem from '@/app/interview/_components/FaqItem';
import CoreFeatureCard from '@/app/interview/_components/CoreFeatureCard';
import GuideCard from '@/app/interview/_components/GuideCard';

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
    question: 'AI 면접 질문은 어떻게 생성되나요?',
    answer:
      '선택한 이력서와 자기소개서의 내용, 지원 기업과 질문 카테고리를 함께 분석해 지원 직무와 경험에 맞는 질문을 생성합니다.',
  },
  {
    id: 2,
    question: '질문을 원하는 것만 골라서 진행할 수 있나요?',
    answer:
      '네. 생성된 질문 중 원하는 카테고리를 선택한 뒤 선택한 질문으로 면접을 시작할 수 있습니다.',
  },
  {
    id: 3,
    question: '지원하는 기업에 맞는 질문도 받을 수 있나요?',
    answer:
      '네. 지원 기업을 선택하면 기업 정보와 선택한 문서를 바탕으로 기업과 직무에 맞는 질문을 생성합니다.',
  },
  {
    id: 4,
    question: '면접 시간은 어떻게 확인할 수 있나요?',
    answer:
      '면접 시작 전 타이머 표시 여부를 선택할 수 있으며, 면접이 끝난 후 실제 소요 시간도 확인할 수 있습니다.',
  },
  {
    id: 5,
    question: '면접이 끝나면 어떤 결과를 확인할 수 있나요?',
    answer:
      '답변내용, 전달력, 논리성, 전문성, 태도를 기준으로 점수를 확인하고 답변별 피드백을 받을 수 있습니다.',
  },
  {
    id: 6,
    question: '면접 결과를 다시 확인할 수 있나요?',
    answer:
      '완료된 면접은 저장되며 마이페이지에서 이전 면접 결과와 질문·답변 기록을 다시 확인할 수 있습니다.',
  },
];

export default function InterviewPage() {
  const router = useRouter();
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

                <ActionButton
                  text="AI 면접 연습 시작하기"
                  href="/interview/chat"
                  className="font_h4"
                  showArrow
                />
              </div>

              <div className={styles.hero_right}>
                <Image
                  src="/images/AIimg.png"
                  alt="AI 면접 로봇"
                  width={650}
                  height={650}
                  priority
                />
              </div>

            </div>
          </div>
        </section>

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
                  onClick={() => router.push('/mypage/activity')}
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
                ❓ 자주 묻는 질문
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

          <section className={styles.feature_section}>
            <h2 className="font_h2">
              🤖 AI 면접의 핵심 기능 설명 🤖
            </h2>

            <div className={styles.feature_cards}>
              <CoreFeatureCard
                variant="green"
                title={
                  <>
                    필요한 면접, 상황에 맞춰
                    <br />
                    커스터마이징하는 AI 면접 코칭
                  </>
                }
                description={
                  <>
                    기업, 직무, 전형별로 필요한 면접을
                    <br />
                    직접 선택하고 연습할 수 있어요.
                  </>
                }
                features={[
                  '기업별 면접 보기',
                  '채용공고별 면접 보기',
                  '직무별 면접 보기',
                ]}
                image="/images/feature-interview.png"
              />

              <CoreFeatureCard
                variant="yellow"
                title={
                  <>
                    내 자소서 / 이력서와 연계 분석으로
                    <br />
                    최적화된 질문을 준비하세요!
                  </>
                }
                description={
                  <>
                    내 이력서와 자기소개서를 분석해
                    <br />
                    나에게 딱 맞는 질문을 추천드려요.
                  </>
                }
                features={[
                  '이력서 기반 질문 생성',
                  '자소서 기반 질문 생성',
                  '예상 질문 리스트 생성',
                ]}
                image="/images/feature-resume.png"
              />
            </div>
          </section>

          <section className={styles.guide_section}>
            <div className={styles.guide_intro}>
              <h2 className="font_h2">
                AI 면접 가이드
              </h2>

              <div className={styles.guide_text}>
                <p className="font_body_s_b">
                  처음이 어렵다면?
                </p>
                <p className="font_body_s_r">
                  가이드를 통해 AI면접을
                  <br />
                  완벽하게 준비해보세요.
                </p>
              </div>

              <ActionButton
                text="AI 면접 시작하기"
                href="/interview/chat"
                variant="purple"
                className="font_body_s_b"
              />
            </div>
            <div className={styles.guide_robot}>
              <Image
                src="/images/AIguide.png"
                alt="AI 면접 가이드 로봇"
                width={130}
                height={210}
              />
            </div>

            <div className={styles.guide_cards}>
              <GuideCard
                icon="badge"
                title="AI 면접이란?"
                description="AI와 채팅하며 실제 면접처럼 질문에 답하고 실전 감각을 익힐 수 있습니다."
              />
              <GuideCard
                icon="thumb_up"
                title="AI 피드백"
                description="답변의 장점과 보완할 점을 분석해 개선 방향과 예시 답변을 제공합니다."
              />
              <GuideCard
                icon="calendar_month"
                title="반복 연습"
                description="다양한 질문을 반복 연습하며 자신만의 면접 답변을 완성해 보세요."
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
