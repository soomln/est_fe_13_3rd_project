import Link from 'next/link';

import styles from './page.module.sass';
import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import StatItem from '@/app/_components/main/StatItem';
import HeroVisual from '@/app/_components/main/HeroVisual';
import ServiceIntro from '@/app/_components/main/ServiceIntro';
import ServiceCard from '@/app/_components/main/ServiceCard';
import CompanySpotlight from '@/app/_components/main/CompanySpotlight';
import FeatureHeader from '@/app/_components/main/FeatureHeader';
import StepListItem from '@/app/_components/main/StepListItem';
import QaListItem from '@/app/_components/main/QaListItem';
import CommunityPostItem from '@/app/_components/main/CommunityPostItem';
import PortfolioSlider from '@/app/_components/main/PortfolioSlider';
import Reveal from '@/app/_components/main/Reveal';
import RecommendedCompanies from '@/app/_components/main/RecommendedCompanies';

const HERO_STATS = [
  { iconSrc: '/images/hero/stat-member.svg', value: '10,000+', label: '회원', tone: 'green' },
  { iconSrc: '/images/hero/stat-portfolio.svg', value: '5,000+', label: '포트폴리오', tone: 'blue' },
  { iconSrc: '/images/hero/stat-review.svg', value: '10,000+', label: '면접 후기', tone: 'yellow' },
  { iconSrc: '/images/hero/stat-satisfaction.svg', value: '10,000+', label: '만족도', tone: 'purple' },
];

const SERVICES = [
  {
    iconSrc: '/images/services/resume.svg',
    title: '이력서/자소서',
    description: 'AI와 무료 양식으로\n완성도 높게 작성하세요.',
    href: '/resume',
    tone: 'green',
  },
  {
    iconSrc: '/images/services/portfolio.svg',
    title: '포트폴리오',
    description: '나만의 포트폴리오를\n간편하게 관리하세요.',
    href: '/portfolio',
    tone: 'sky',
  },
  {
    iconSrc: '/images/services/interview.svg',
    title: 'AI 면접 준비',
    description: 'AI 예상 질문으로\n실전 감각을 키우세요.',
    href: '/interview',
    tone: 'amber',
  },
  {
    iconSrc: '/images/services/companies.svg',
    title: '기업 탐색',
    description: '기업 후기와 족보를\n한눈에 확인하세요.',
    href: '/search-companies',
    tone: 'orange',
  },
  {
    iconSrc: '/images/services/team.svg',
    title: '팀 프로젝트',
    description: '함께할 팀원을 찾고\n프로젝트를 시작하세요.',
    href: '/community',
    tone: 'violet',
  },
  {
    iconSrc: '/images/services/community.svg',
    title: '커뮤니티',
    description: '질문하고 답변하며\n함께 성장하세요.',
    href: '/community',
    tone: 'violet',
  },
];

const RESUME_STEPS = [
  { step: '1', title: '무료 양식으로 시작', desc: '개발자를 위한 무료 양식을 선택하고 편집' },
  { step: '2', title: '브라우저에서 편집', desc: '별도 프로그램 설치 없이 웹에서 편집·저장·다운로드' },
  { step: '3', title: 'AI와 함께 작성', desc: '장단점, 지원동기처럼 쓰기 어려운 항목도 더 쉽고 명확하게' },
  { step: '4', title: '최종점검 및 작성 완료', desc: '작성한 서류 데이터를 기반으로 AI 면접 연습 시작' },
];

const INTERVIEW_QA = [
  { type: 'q', text: '자기소개를 간단히 해주세요.' },
  { type: 'a', text: '···' },
  { type: 'q', text: '지원 동기를 말씀 해주세요.' },
  { type: 'q', text: '협업 중 갈등을 해결한 경험은?' },
];

const COMMUNITY_POSTS = [
  { title: '백엔드 스터디', tag: 'Spring Boot · Java', status: '모집중' },
  { title: '쇼핑몰 플랫폼 개발 프로젝트', tag: 'React · TypeScript', status: '모집 마감' },
  { title: '코딩테스트 스터디', tag: 'C++', status: '모집중' },
  { title: '면접 스터디', tag: '프론트엔드', status: '모집중' },
];

const POPULAR_KEYWORDS = ['카카오', '네이버', '토스', 'SK 하이닉스', '삼성SDS', '배민'];

export default function Home() {
  return (
    <>
      <Header />

      <main>
        {/* 1. 히어로 */}
        <section className={styles.hero}>
          <div className={`container ${styles.hero_inner}`}>
            <div className={styles.hero_content}>
              <span className={`font_body_s_b ${styles.hero_badge}`}>
                <span className='material-symbols-rounded' aria-hidden='true'>
                  auto_awesome
                </span>
                AI 기반 취업 준비 플랫폼
              </span>

              <h1 className={`font_title ${styles.hero_title}`}>
                <span className={styles.hero_title_line}>당신의 취업 과정을</span>
                <span className={styles.hero_title_line}>
                  <span className={styles.hero_title_highlight}>최적화 </span>
                  하세요
                </span>
              </h1>

              <p className={`font_body_l_r ${styles.hero_desc}`}>
                이력서·자기소개서 작성, AI 면접 준비, 기업 탐색, 커뮤니티까지
                <br />
                개발자 취업의 모든 과정을 한 곳에서
              </p>

              <div className={styles.hero_btns}>
                <Link href='/resume' className={`font_h4 ${styles.hero_btn_primary}`}>
                  취업 서류 작성하기
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    arrow_forward
                  </span>
                </Link>
                <Link href='/interview' className={`font_h4 ${styles.hero_btn_secondary}`}>
                  AI 면접 연습하기
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className={styles.hero_stats}>
                {HERO_STATS.map((item) => (
                  <StatItem key={item.label} iconSrc={item.iconSrc} value={item.value} label={item.label} tone={item.tone} />
                ))}
              </div>
            </div>

            <HeroVisual />
          </div>
        </section>

        {/* 2. 서비스 소개 */}
        <section className={styles.services}>
          <div className={styles.services_inner}>
            <Reveal>
              <ServiceIntro />
            </Reveal>

            <ul className={styles.service_grid}>
              {SERVICES.map((item) => (
                <ServiceCard key={item.title} {...item} />
              ))}
            </ul>
          </div>
        </section>

        {/* 3. 포트폴리오 홍보 */}
        <section className={styles.showcase}>
          <div className={styles.showcase_inner}>
            <div className={styles.showcase_intro}>
              <Reveal>
                <div className={styles.showcase_text_group}>
                  <p className={`font_h4 ${styles.showcase_eyebrow}`}>PORTFOLIO</p>
                  <h2 className={`font_h1 ${styles.showcase_title}`}>나의 포트폴리오로 가능성을 보여주세요</h2>
                  <p className={`font_body_l_r ${styles.showcase_desc}`}>
                    Demo 자료, 기술 문서, 핵심 코드까지
                    <br />
                    흩어진 자료를 한 곳에 정리하고 채용 기회를 잡아보세요
                  </p>
                </div>
              </Reveal>

              <ul className={styles.showcase_points}>
                <li className={`font_body_l_r ${styles.showcase_point}`}>
                  <span className={styles.showcase_point_icon}>
                    <span className='material-symbols-rounded' aria-hidden='true'>
                      check
                    </span>
                  </span>
                  AI가 도와주는 기술문서 정리
                </li>
                <li className={`font_body_l_r ${styles.showcase_point}`}>
                  <span className={styles.showcase_point_icon}>
                    <span className='material-symbols-rounded' aria-hidden='true'>
                      check
                    </span>
                  </span>
                  AI가 추천하는 핵심 코드 어필
                </li>
              </ul>

              <Link href='/portfolio' className={`font_h4 ${styles.showcase_btn}`}>
                포트폴리오 등록하기
                <span className='material-symbols-sharp' aria-hidden='true'>
                  arrow_forward
                </span>
              </Link>
            </div>

            <PortfolioSlider />
          </div>
        </section>

        {/* 4. 기업 정보 / 탐색 */}
        <section className={styles.company}>
          <div className={styles.company_inner}>
            <Reveal>
              <div className={styles.company_text_group}>
                <p className={`font_h4 ${styles.company_eyebrow}`}>HOW IT WORKS</p>
                <h2 className={`font_h1 ${styles.company_title}`}>나에게 맞는 기업 탐색</h2>
                <p className={`font_body_l_r ${styles.company_desc}`}>나의 데이터와 AI 피드백으로 확실한 결과를 만들어보세요</p>
              </div>
            </Reveal>

            <div className={styles.company_row}>
              <div className={styles.company_spotlight_wrap}>
                <CompanySpotlight />
              </div>

              <div className={styles.company_search}>
                <h3 className={`font_h3 ${styles.company_search_heading}`}>맞춤 기업 탐색</h3>

                <div className={styles.company_search_panel}>
                  <div className={styles.company_search_intro}>
                    <p className={`font_body_m_b ${styles.company_search_title}`}>어느 기업이 궁금하신가요?</p>
                    <p className={`font_body_s_r ${styles.company_search_desc}`}>
                      평균 연봉부터 기업의 평가, 면접 질문 족보까지 확인해보세요.
                    </p>
                  </div>

                  <div className={styles.company_search_box}>
                    <span className='material-symbols-rounded' aria-hidden='true'>
                      search
                    </span>
                    <input
                      type='text'
                      placeholder='원하시는 기업, 직무, 기술 스택을 검색해보세요.'
                      className={`font_caption_b ${styles.company_search_input}`}
                    />
                  </div>
                </div>

                <div className={styles.company_keyword_group}>
                  <p className={`font_caption_b ${styles.company_keyword_label}`}>인기 검색어</p>
                  <div className={styles.company_keywords}>
                    {POPULAR_KEYWORDS.map((keyword) => (
                      <span key={keyword} className={`font_caption_b ${styles.company_keyword}`}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <RecommendedCompanies />

                <Link href='/search-companies' className={`font_body_s_b ${styles.company_search_btn}`}>
                  기업 탐색하기
                  <span className='material-symbols-rounded' aria-hidden='true'>
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. 3단 기능 소개 */}
        <section className={styles.features}>
          <div className={styles.features_inner}>
            <Reveal>
              <div className={styles.features_text_group}>
                <p className={`font_h4 ${styles.features_eyebrow}`}>FEATURES</p>
                <h2 className={`font_h1 ${styles.features_title}`}>핵심 기능 살펴보기</h2>
                <p className={`font_body_l_r ${styles.features_desc}`}>저장한 데이터는 CallBack의 모든 서비스와 연결돼요</p>
              </div>
            </Reveal>

            <div className={styles.features_grid}>
              {/* 이력서·자기소개서 작성 */}
              <div className={`${styles.feature_card} ${styles.tone_green}`}>
                <FeatureHeader
                  icon='description'
                  title='이력서·자기소개서 작성'
                  description='AI와 함께 완벽한 지원서를 지금 완성해보세요 !'
                  tone='green'
                />

                <div className={styles.feature_body}>
                  <div className={styles.feature_tags}>
                    {['맞춤형', 'AI 작성', 'AI 첨삭'].map((tag) => (
                      <span key={tag} className={`font_caption_b ${styles.feature_tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <ol className={styles.feature_list}>
                    {RESUME_STEPS.map((item) => (
                      <li key={item.step}>
                        <StepListItem number={item.step} title={item.title} description={item.desc} />
                      </li>
                    ))}
                  </ol>

                  <Link href='/resume' className={`font_caption_b ${styles.feature_btn}`}>
                    새로 작성하기
                    <span className='material-symbols-rounded' aria-hidden='true'>
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>

              {/* AI 면접 연습 */}
              <div className={`${styles.feature_card} ${styles.tone_amber}`}>
                <FeatureHeader icon='mic' title='AI 면접 연습' description='AI 모의 면접으로 자신감을 높이세요 !' tone='amber' />

                <div className={styles.feature_body}>
                  <div className={styles.feature_tags}>
                    {['맞춤형', 'AI 질문', '실전형'].map((tag) => (
                      <span key={tag} className={`font_caption_b ${styles.feature_tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <ol className={styles.feature_list}>
                    {INTERVIEW_QA.map((qa, i) =>
                      qa.type === 'a' ? (
                        <li key={i} className={styles.feature_answer_row}>
                          <span className='material-symbols-rounded' aria-hidden='true'>
                            subdirectory_arrow_right
                          </span>
                          <QaListItem label='A' question={qa.text} tone='gray' />
                        </li>
                      ) : (
                        <li key={i}>
                          <QaListItem label='Q' question={qa.text} tone='amber' />
                        </li>
                      ),
                    )}
                  </ol>

                  <Link href='/interview' className={`font_caption_b ${styles.feature_btn}`}>
                    AI 면접 시작하기
                    <span className='material-symbols-rounded' aria-hidden='true'>
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>

              {/* 팀 매칭 · 커뮤니티 */}
              <div className={`${styles.feature_card} ${styles.tone_purple}`}>
                <FeatureHeader icon='diversity_3' title='팀 매칭 · 커뮤니티' description='사람들과 정보를 공유하고 함께 성장하세요 !' tone='purple' />

                <div className={styles.feature_body}>
                  <div className={styles.feature_tags}>
                    {['팀 프로젝트', '스터디', '자유게시판'].map((tag) => (
                      <span key={tag} className={`font_caption_b ${styles.feature_tag}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <ul className={styles.feature_list}>
                    {COMMUNITY_POSTS.map((post) => (
                      <li key={post.title}>
                        <CommunityPostItem title={post.title} tag={post.tag} status={post.status} />
                      </li>
                    ))}
                  </ul>

                  <Link href='/community' className={`font_caption_b ${styles.feature_btn}`}>
                    팀원 구하기
                    <span className='material-symbols-rounded' aria-hidden='true'>
                      arrow_forward
                    </span>
                  </Link>
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
