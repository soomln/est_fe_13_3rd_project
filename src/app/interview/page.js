import styles from './page.module.sass';
import Image from 'next/image';

import Header from '../_components/common/Header/Header';
import Footer from '../_components/common/Footer/Footer';

import ActionButton from '@/app/interview/components/ActionButton';
import FeatureCard from '@/app/interview/components/FeatureCard';
import CompanyCard from '@/app/interview/components/CompanyCard';

export default function InterviewPage() {
  return (
    <>
      <Header />

      <main className={styles.interview_page}>
        <div className='container'>
          <section className={styles.hero_section}>
            <div className={styles.hero_left}>
              <div className={styles.hero_title}>
                <span className='font_body_l_r'>오늘도 성장하는 당신을 응원해요.</span>

                <h1 className='font_subtitle'>
                  오늘도 <strong>AI 면접 연습</strong>을
                  <br />
                  시작해볼까요?
                </h1>
              </div>

              <div className={styles.hero_cards}>
                <FeatureCard
                  title='이력서 / 자소서 기반 면접 질문 생성'
                  description='작성한 이력서 / 자소서에 맞게 예상 질문을 생성해드려요.'
                />
                <FeatureCard
                  title='기업 선택 후 맞춤 질문 생성'
                  description='선택한 기업과 직무에 맞는 예상 면접 질문을 AI가 생성해드립니다.'
                />
                <FeatureCard
                  title='실제 면접 흐름 그대로 진행'
                  description='실전처럼 연습하고, 답변을 피드백 받을 수 있어요.'
                />
              </div>

              <ActionButton text='AI 면접 연습 시작하기' />
            </div>

            <div className={styles.hero_right}>
              <Image
                src='/images/AIimg.png'
                alt='AI 면접 로봇'
                width={650}
                height={650}
                className={styles.hero_image}
                priority
              />
            </div>
          </section>

          {/* 관심기업 + 자주 묻는 질문 */}
          <section className='content_section'>
            <section className='company_section'>
              <div className='company_header'>
                <h2 className='font_h3'>나의 관심 기업</h2>

                <button type='button' className='view_all_btn font_body_s_r'>
                  전체 보기
                </button>
              </div>

              <div className='company_list'>
                <CompanyCard />
                <CompanyCard />
                <CompanyCard />
                <CompanyCard />
              </div>
            </section>

            <section className='question_section'></section>
          </section>

          {/* 핵심 기능 */}
          <section className='feature_section'></section>

          {/* AI 면접 가이드 */}
          <section className='guide_section'></section>
        </div>
      </main>

      <Footer />
    </>
  );
}
