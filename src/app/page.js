import Link from 'next/link';

import styles from './page.module.sass';
import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import ServiceCard from '@/app/_components/main/ServiceCard';
import StatItem from '@/app/_components/main/StatItem';
import PortfolioPreview from '@/app/_components/main/PortfolioPreview';

const HERO_STATS = [
  { icon: 'group', value: '10,000+', label: '회원' },
  { icon: 'work', value: '5,000+', label: '포트폴리오' },
  { icon: 'forum', value: '10,000+', label: '면접 후기' },
  { icon: 'sentiment_satisfied', value: '10,000+', label: '만족도' },
];

const SERVICES = [
  {
    icon: 'description',
    title: '이력서·자소서',
    description: 'AI와 무료 양식으로 완성도 높게 작성하세요.',
    href: '/resume',
  },
  { icon: 'palette', title: '포트폴리오', description: '나만의 포트폴리오를 간편하게 관리하세요.', href: '/portfolio' },
  { icon: 'mic', title: 'AI 면접 준비', description: 'AI 예상 질문으로 실전 감각을 키우세요.', href: '/interview' },
  {
    icon: 'apartment',
    title: '기업 탐색',
    description: '기업 후기와 족보를 한눈에 확인하세요.',
    href: '/search-companies',
  },
  {
    icon: 'groups',
    title: '팀 프로젝트',
    description: '함께할 팀원을 찾고 프로젝트를 시작하세요.',
    href: '/community',
  },
  { icon: 'chat_bubble', title: '커뮤니티', description: '질문하고 답변하며 함께 성장하세요.', href: '/community' },
];

const RESUME_STEPS = [
  { step: '1', title: '무료 양식으로 시작', desc: '개발자를 위한 무료 양식을 선택하고 편집' },
  { step: '2', title: '브라우저에서 편집', desc: '별도 프로그램 설치 없이 웹에서 편집·저장·다운로드' },
  { step: '3', title: 'AI와 함께 작성', desc: '장단점, 지원동기처럼 쓰기 어려운 항목도 더 쉽고 명확하게' },
  { step: '4', title: '최종점검 및 작성 완료', desc: '작성한 서류 데이터를 기반으로 AI 면접 연습 시작' },
];

const INTERVIEW_QUESTIONS = ['자기소개를 간단히 해주세요.', '지원 동기를 말씀해주세요.', '협업 중 갈등을 해결한 경험은?'];

const COMMUNITY_POSTS = [
  { title: '백엔드 스터디', tag: 'Spring Boot · Java', status: '모집중' },
  { title: '쇼핑몰 플랫폼 개발 프로젝트', tag: 'React · TypeScript', status: '모집 마감' },
  { title: '코딩테스트 스터디', tag: 'C++', status: '모집중' },
];

const COMPANY_SCORES = [
  { label: '급여 · 보상', value: '4.5' },
  { label: '워라벨', value: '4.5' },
  { label: '사내 문화', value: '4.5' },
  { label: '성장 가능성', value: '4.5' },
];

const COMPANY_SALARY = [
  { label: '전체 평균', value: '5,240만원' },
  { label: '신입 평균', value: '3,800만원' },
  { label: '상위 25%', value: '7,100만원' },
];

const POPULAR_KEYWORDS = ['카카오', '네이버', '토스', 'SK 하이닉스', '삼성SDS', '배민'];

const RECOMMENDED_COMPANIES = [
  { name: '토스', desc: '채용중 4건 · IT/개발, 디자인' },
  { name: '네이버', desc: '채용중 8건 · IT/개발, 데이터' },
  { name: '카카오', desc: '채용중 12건 · IT/개발, 기획' },
];

const SAMPLE_PORTFOLIO = {
  id: 1,
  title: '포트폴리오 웹사이트',
  authorName: '김지수 · 풀스택 개발자',
  thumbnailUrl: '',
  likeCount: 0,
  bookmarkCount: 0,
};

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* 1. 히어로 */}
        <section className={styles.hero}>
          <div className={`container ${styles.hero_inner}`}>
            <span className={`font_body_s_b ${styles.hero_badge}`}>AI 기반 취업 준비 플랫폼</span>

            <h1 className={`font_title ${styles.hero_title}`}>당신의 취업 과정을 최적화 하세요</h1>

            <p className={`font_body_l_r ${styles.hero_desc}`}>
              이력서·자기소개서 작성, AI 면접 준비, 기업 탐색, 커뮤니티까지 개발자 취업의 모든 과정을 한 곳에서
            </p>

            <div className={styles.hero_btns}>
              <Link href='/resume' className={`font_body_m_b ${styles.hero_btn_primary}`}>
                지금 시작하기
              </Link>
              <Link href='/portfolio' className={`font_body_m_b ${styles.hero_btn_secondary}`}>
                서비스 둘러보기
              </Link>
            </div>

            <div className={styles.hero_stats}>
              {HERO_STATS.map((item) => (
                <StatItem key={item.label} icon={item.icon} value={item.value} label={item.label} />
              ))}
            </div>
          </div>
        </section>

        {/* 2. 서비스 소개 */}
        <section className={styles.services}>
          <div className='container'>
            <ul className={styles.service_grid}>
              {SERVICES.map((item) => (
                <ServiceCard key={item.title} {...item} />
              ))}
            </ul>
          </div>
        </section>

        {/* 3. 포트폴리오 홍보 */}
        <section className={styles.showcase}>
          <div className={`container ${styles.showcase_inner}`}>
            <div className={styles.showcase_intro}>
              <h2 className={`font_h1 ${styles.showcase_title}`}>포트폴리오로 나를 어필하세요</h2>

              <ul className={styles.showcase_points}>
                <li className={`font_body_l_r ${styles.showcase_point}`}>
                  <span className='material-symbols-rounded' aria-hidden='true'>
                    check_circle
                  </span>
                  AI가 도와주는 기술문서 정리
                </li>
                <li className={`font_body_l_r ${styles.showcase_point}`}>
                  <span className='material-symbols-rounded' aria-hidden='true'>
                    check_circle
                  </span>
                  AI가 추천하는 핵심 코드 어필
                </li>
              </ul>

              <Link href='/portfolio' className={`font_body_m_b ${styles.showcase_btn}`}>
                포트폴리오 만들기
              </Link>
            </div>

            <PortfolioPreview item={SAMPLE_PORTFOLIO} />
          </div>
        </section>

        {/* 4. 기업 정보 / 탐색 */}
        <section className={styles.company}>
          <div className={`container ${styles.company_inner}`}>
            <div className={styles.company_spotlight}>
              <span className={`font_body_s_b ${styles.company_badge}`}>이스트소프트</span>

              <h3 className={`font_h4 ${styles.company_sub_title}`}>평균 연봉</h3>
              <div className={styles.company_salary_row}>
                {COMPANY_SALARY.map((item) => (
                  <div key={item.label} className={styles.company_salary_col}>
                    <span className={`font_body_s_r ${styles.company_salary_label}`}>{item.label}</span>
                    <span className={`font_h4 ${styles.company_salary_value}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              <ul className={styles.company_scores}>
                {COMPANY_SCORES.map((item) => (
                  <li key={item.label} className={styles.company_score_item}>
                    <span className={`font_body_s_r ${styles.company_score_label}`}>{item.label}</span>
                    <span className={`font_h4 ${styles.company_score_value}`}>{item.value}점</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.company_search}>
              <h2 className={`font_h2 ${styles.company_search_title}`}>어느 기업이 궁금하신가요?</h2>
              <p className={`font_body_s_r ${styles.company_search_desc}`}>
                평균 연봉부터 기업의 평가, 면접 질문 족보까지 확인해보세요.
              </p>

              <div className={styles.company_search_box}>
                <span className='material-symbols-rounded' aria-hidden='true'>
                  search
                </span>
                <input
                  type='text'
                  placeholder='기업, 직무, 기술 스택 검색'
                  className={`font_body_s_r ${styles.company_search_input}`}
                />
              </div>

              <div className={styles.company_keywords}>
                {POPULAR_KEYWORDS.map((keyword) => (
                  <span key={keyword} className={`font_body_s_r ${styles.company_keyword}`}>
                    {keyword}
                  </span>
                ))}
              </div>

              <ul className={styles.company_list}>
                {RECOMMENDED_COMPANIES.map((company) => (
                  <li key={company.name} className={styles.company_list_item}>
                    <span className={`font_body_m_b ${styles.company_list_name}`}>{company.name}</span>
                    <span className={`font_body_s_r ${styles.company_list_desc}`}>{company.desc}</span>
                  </li>
                ))}
              </ul>

              <Link href='/search-companies' className={`font_body_m_b ${styles.company_search_btn}`}>
                기업 탐색하기
              </Link>
            </div>
          </div>
        </section>

        {/* 5. 3단 기능 소개 */}
        <section className={styles.features}>
          <div className={`container ${styles.features_inner}`}>
            {/* 이력서·자기소개서 작성 */}
            <div className={styles.feature_card}>
              <span className='material-symbols-rounded' aria-hidden='true'>
                edit_document
              </span>
              <h3 className={`font_h4 ${styles.feature_title}`}>이력서·자기소개서 작성</h3>
              <p className={`font_body_s_r ${styles.feature_desc}`}>AI와 함께 완벽한 지원서를 지금 완성해보세요!</p>

              <ol className={styles.feature_step_list}>
                {RESUME_STEPS.map((item) => (
                  <li key={item.step} className={styles.feature_step_item}>
                    <span className={`font_body_s_b ${styles.feature_step_num}`}>{item.step}</span>
                    <div>
                      <p className={`font_body_s_b ${styles.feature_step_title}`}>{item.title}</p>
                      <p className={`font_caption_r ${styles.feature_step_desc}`}>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <Link href='/resume' className={`font_body_s_b ${styles.feature_btn}`}>
                새로 작성하기
              </Link>
            </div>

            {/* AI 면접 연습 */}
            <div className={styles.feature_card}>
              <span className='material-symbols-rounded' aria-hidden='true'>
                mic
              </span>
              <h3 className={`font_h4 ${styles.feature_title}`}>AI 면접 연습</h3>
              <p className={`font_body_s_r ${styles.feature_desc}`}>AI 모의 면접으로 자신감을 높이세요!</p>

              <ul className={styles.feature_qa_list}>
                {INTERVIEW_QUESTIONS.map((question) => (
                  <li key={question} className={`font_body_s_r ${styles.feature_qa_item}`}>
                    Q. {question}
                  </li>
                ))}
              </ul>

              <Link href='/interview' className={`font_body_s_b ${styles.feature_btn}`}>
                AI 면접 시작하기
              </Link>
            </div>

            {/* 팀 매칭 · 커뮤니티 */}
            <div className={styles.feature_card}>
              <span className='material-symbols-rounded' aria-hidden='true'>
                diversity_3
              </span>
              <h3 className={`font_h4 ${styles.feature_title}`}>팀 매칭 · 커뮤니티</h3>
              <p className={`font_body_s_r ${styles.feature_desc}`}>사람들과 정보를 공유하고 함께 성장하세요!</p>

              <ul className={styles.feature_post_list}>
                {COMMUNITY_POSTS.map((post) => (
                  <li key={post.title} className={styles.feature_post_item}>
                    <div>
                      <p className={`font_body_s_b ${styles.feature_post_title}`}>{post.title}</p>
                      <p className={`font_caption_r ${styles.feature_post_tag}`}>{post.tag}</p>
                    </div>
                    <span className={`font_caption_b ${styles.feature_post_status}`}>{post.status}</span>
                  </li>
                ))}
              </ul>

              <Link href='/community' className={`font_body_s_b ${styles.feature_btn}`}>
                팀원 구하기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
