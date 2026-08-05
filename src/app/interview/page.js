import './page.module.sass';

import Header from '../_components/common/Header';
import Footer from '../_components/common/Footer';

import InterviewStart from './components/InterviewStart';
import CompanyCard from './components/CompanyCard';
import GuideCard from './components/GuideCard';

export default function InterviewPage() {
  return (
    <>
      <Header />

      <main className="interview_page">
        <div className="container">

          {/* 히어로 */}
          <section className="hero_section">
          </section>

          {/* 관심기업 + 자주 묻는 질문 */}
          <section className="content_section">

            <section className="company_section">
            </section>

            <section className="question_section">
            </section>

          </section>

          {/* 핵심 기능 */}
          <section className="feature_section">
          </section>

          {/* AI 면접 가이드 */}
          <section className="guide_section">
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
}