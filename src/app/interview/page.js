'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.sass';
import Image from 'next/image';

import Header from '../_components/common/Header/Header';
import Footer from '../_components/common/Footer/Footer';
import { useAuth } from '@/app/_components/auth';

import ActionButton from '@/app/interview/_components/ActionButton';
import FeatureCard from '@/app/interview/_components/FeatureCard';
import CompanyCard from '@/app/interview/_components/CompanyCard';
import FaqItem from '@/app/interview/_components/FaqItem';
import CoreFeatureCard from '@/app/interview/_components/CoreFeatureCard';
import GuideCard from '@/app/interview/_components/GuideCard';
import { listCompanies, listMyBookmarkedCompanies } from '@backend/lib/api/companies';

const INTEREST_COMPANY_COUNT = 4;

function toCompanyCardProps(company) {
  return {
    id: company.id,
    logo: company.logo,
    companyName: company.name,
    position: company.category,
    salary: company.avgSalary,
    rating: company.rating,
  };
}

const faqList = [
  {
    id: 1,
    question: 'AI 면접 질문은 어떻게 생성되나요?',
    answerTitle: '네, 맞춤형으로 생성됩니다!',
    answer:
      '선택한 이력서와 자기소개서의 내용, 지원 기업과 질문 카테고리를 함께 분석해 지원 직무와 경험에 맞는 질문을 생성합니다.',
    details: [
      '이력서와 자기소개서 기반 질문 생성',
      '지원 기업 및 직무 정보 반영',
      '개인의 경험에 맞는 맞춤 질문 제공',
    ],
  },
  {
    id: 2,
    question: '질문을 원하는 것만 골라서 진행할 수 있나요?',
    answerTitle: '네, 원하는 질문만 선택할 수 있어요!',
    answer:
      '생성된 질문 중 원하는 카테고리와 질문을 선택해 필요한 내용만 골라서 면접을 진행할 수 있습니다.',
    details: [
      '원하는 질문 카테고리 선택',
      '필요한 질문만 골라 면접 진행',
      '선택한 질문으로 집중 연습 가능',
    ],
  },
  {
    id: 3,
    question: '지원하는 기업에 맞는 질문도 받을 수 있나요?',
    answerTitle: '네, 기업별 맞춤 질문을 받을 수 있어요!',
    answer:
      '지원 기업의 정보와 선택한 직무를 바탕으로 해당 기업과 직무에 맞는 예상 면접 질문을 생성합니다.',
    details: [
      '지원 기업 정보 반영',
      '지원 직무에 맞는 질문 생성',
      '기업별 예상 질문으로 면접 준비',
    ],
  },
  {
    id: 4,
    question: '면접 시간은 어떻게 확인할 수 있나요?',
    answerTitle: '면접 진행 시간을 확인할 수 있어요!',
    answer:
      '면접을 시작하면 진행 시간이 기록되며, 면접이 끝난 후 실제 소요 시간을 확인할 수 있습니다.',
    details: [
      '면접 진행 시간 자동 기록',
      '면접 종료 후 소요 시간 확인',
      '실제 면접과 비슷한 환경에서 연습',
    ],
  },
  {
    id: 5,
    question: '면접이 끝나면 어떤 결과를 확인할 수 있나요?',
    answerTitle: '면접 결과와 AI 피드백을 확인할 수 있어요!',
    answer:
      '면접이 끝나면 답변 내용을 분석해 전달력, 논리성, 전문성 등을 기준으로 피드백과 개선 방향을 제공합니다.',
    details: [
      '답변별 AI 피드백 확인',
      '면접 평가 점수 확인',
      '개선이 필요한 답변과 방향 확인',
    ],
  },
  {
    id: 6,
    question: '면접 결과를 다시 확인할 수 있나요?',
    answerTitle: '네, 언제든 다시 확인할 수 있어요!',
    answer:
      '완료된 면접 결과를 저장하면 마이페이지에서 이전 면접의 질문과 답변, 평가 결과를 다시 확인할 수 있습니다.',
    details: [
      '지난 면접 기록 다시 확인',
      '질문과 답변 내용 열람',
      '이전 면접 결과와 비교 분석',
    ],
  },
];

export default function InterviewPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: isAuthLoading, openLogin } = useAuth();
  const [companies, setCompanies] = useState([]);

  const handleStartInterview = () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }
    router.push('/interview/chat');
  };

  useEffect(() => {
    if (isAuthLoading) return;

    let cancelled = false;

    const load = async () => {
      let items = [];

      if (isLoggedIn) {
        try {
          const page = await listMyBookmarkedCompanies({ pageSize: INTEREST_COMPANY_COUNT });
          items = page?.items ?? [];
        } catch { }
      }

      if (items.length === 0) {
        try {
          const page = await listCompanies({ pageSize: INTEREST_COMPANY_COUNT });
          items = page?.items ?? [];
        } catch { }
      }

      if (!cancelled) setCompanies(items);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, isLoggedIn]);

  const interestedCompanies = companies.map(toCompanyCardProps);

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
                  onClick={handleStartInterview}
                  className="font_h4"
                  showArrow
                />
              </div>
              <div className={styles.hero_right}>
                <div className={styles.hero_visual}>
                  <img
                    src="/images/interview/AIimg.png"
                    alt="AI 면접 플랫폼"
                    className={styles.hero_image}
                  />

                  <div
                    className={`${styles.hero_bubble} ${styles.hero_bubble_green}`}
                  >
                    <span>•••</span>
                  </div>

                  <div
                    className={`${styles.hero_bubble} ${styles.hero_bubble_purple}`}
                  >
                    <span>•••</span>
                  </div>

                  <div
                    className={`${styles.hero_bubble} ${styles.hero_bubble_yellow}`}
                  >
                    <span>•••</span>
                  </div>

                  <span className={`${styles.hero_shape} ${styles.hero_heart}`}>
                    ♥
                  </span>

                  <span className={`${styles.hero_star} ${styles.hero_star_1}`}>
                    ✦
                  </span>

                  <span className={`${styles.hero_star} ${styles.hero_star_2}`}>
                    ✦
                  </span>

                  <span className={`${styles.hero_star} ${styles.hero_star_3}`}>
                    ✦
                  </span>

                  <span
                    className={`${styles.hero_circle} ${styles.hero_circle_1}`}
                  />

                  <span
                    className={`${styles.hero_circle} ${styles.hero_circle_2}`}
                  />

                  <span
                    className={`${styles.hero_circle} ${styles.hero_circle_3}`}
                  />

                  <span
                    className={`${styles.hero_circle} ${styles.hero_circle_4}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          <section className={styles.content_section}>
            <section className={styles.company_section}>
              <div className={styles.company_header}>
                <div className={styles.company_heading}>
                  <div className={styles.company_title}>
                    <span className={`${styles.title_star} material-symbols-rounded`}>
                      star
                    </span>

                    <h2 className="font_h3">
                      나의 관심 기업
                    </h2>
                  </div>

                  <p className="font_body_s_r">
                    관심 등록한 기업을 확인하고, 맞춤 면접을 준비해보세요!
                  </p>
                </div>

                <button
                  type="button"
                  className={`${styles.view_all_btn} font_body_s_r`}
                  onClick={() => router.push('/mypage/activity')}
                >
                  <span>전체 보기</span>

                  <span className="material-symbols-rounded">
                    arrow_forward
                  </span>
                </button>
              </div>

              <div className={styles.company_list}>
                {interestedCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    {...company}
                  />
                ))}
              </div>
            </section>

            <section className={styles.question_section}>
              <div className={styles.question_heading}>
                <div className={styles.question_title}>
                  <span className={`${styles.question_icon} material-symbols-rounded`}>
                    question_mark
                  </span>

                  <h2 className="font_h3">
                    자주 묻는 질문
                  </h2>
                </div>

                <p className="font_body_s_r">
                  AI 면접에 대해 자주 묻는 질문을 확인해보세요!
                </p>
              </div>

              <div className={styles.question_list}>
                {faqList.map((faq) => (
                  <FaqItem
                    key={faq.id}
                    question={faq.question}
                    answer={faq.answer}
                    answerTitle={faq.answerTitle}
                    details={faq.details}
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
                image="/images/interview/feature-interview.png"
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
                image="/images/interview/feature-resume.png"
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
                onClick={handleStartInterview}
                variant="purple"
                className="font_body_s_b"
              />
            </div>
            <div className={styles.guide_robot}>
              <Image
                src="/images/interview/AIguide.png"
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
