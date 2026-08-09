import Link from 'next/link';

import ProfileSection from '@/app/mypage/_components/ProfileSection';
import InfoRow from '@/app/mypage/_components/InfoRow';
import AwardRow from '@/app/mypage/_components/AwardRow';
import LogoItem from '@/app/mypage/_components/LogoItem';
import styles from './page.module.sass';

// 주의: supabase 연결 전까지 쓰는 임시 정보
const PROFILE = {
  name: '홍길동',
  headline: '프론트엔드 개발자 · 신입',
  email: 'honggildong@email.com',
  github: 'github.com/honggildong',
  avatarUrl: '',
  bio: '사용자가 겪는 불편을 화면 단위로 쪼개서 해결하는 일을 좋아하는 프론트엔드 개발자입니다. 부트캠프에서 6개월간 3개의 팀 프로젝트를 진행하며 React와 상태 관리, 그리고 협업 과정에서의 커뮤니케이션을 배웠습니다. 특히 팀 프로젝트에서 갈등이 생겼을 때 먼저 이야기를 꺼내 조율하는 역할을 자주 맡았고, 그 과정에서 기록과 문서화의 중요함을 크게 느꼈습니다.',
};

const STATS = [
  { value: 4, label: '문서', tone: 'black' },
  { value: 3, label: '포트폴리오', tone: 'green' },
  { value: 6, label: '면접 스크랩', tone: 'amber' },
];

const EDUCATIONS = [
  { title: '서울개발대학교', sub: '소프트웨어학과', meta: '2020.03 – 2024.02', badge: '졸업' },
];

const CAREERS = [
  { title: '이스트소프트', sub: '프론트엔드 개발자', meta: '2025.03 – 현재', badge: '재직 중' },
  {
    title: '이스트시큐리티',
    sub: '웹 퍼블리싱',
    meta: '2024.07 – 2025.02',
    badge: '퇴사',
    badgeTone: 'plain',
  },
];

const LANGUAGES = [
  { title: '영어', sub: '비즈니스 회화 가능 · OPIc IH', badge: '상' },
  { title: '일본어', sub: '일상 회화 가능', badge: '중' },
];

const AWARDS = [
  { title: '부트캠프 최종 프로젝트 대상', date: '2026.01' },
  { title: '교내 해커톤 우수상', date: '2026.01' },
];

const SKILLS = ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Java', 'Git'];

const COMPANIES = ['XX컴퍼니', 'OO테크', '△△랩스', '□□소프트', '◇◇스튜디오'];

const INTERESTS = ['프론트엔드', '웹 접근성'];

export default function MyPage() {
  return (
    <>
      <div className={styles.mypage_head}>
        <div className={styles.mypage_head_text}>
          <h1 className={`${styles.mypage_head_title} font_h1`}>프로필</h1>
          <p className={`${styles.mypage_head_desc} font_body_m_r`}>
            서류와 면접 준비에 함께 쓰이는 내 기본 정보예요.
          </p>
        </div>

        <Link href='/mypage?mode=edit' className={`${styles.mypage_head_btn} font_body_l_b`}>
          <span className='material-symbols-sharp' aria-hidden='true'>
            edit
          </span>
          프로필 수정
        </Link>
      </div>

      <section className={styles.mypage_summary}>
        {PROFILE.avatarUrl ? (
          <img src={PROFILE.avatarUrl} alt='' className={styles.mypage_summary_avatar} />
        ) : (
          <span className={styles.mypage_summary_avatar} />
        )}

        <div className={styles.mypage_summary_text}>
          <p className={`${styles.mypage_summary_name} font_h1`}>{PROFILE.name}</p>
          <p className={`${styles.mypage_summary_headline} font_body_l_r`}>{PROFILE.headline}</p>

          <p className={styles.mypage_summary_contact}>
            <span className={`${styles.mypage_summary_email} font_body_s_r`}>{PROFILE.email}</span>
            <span className={styles.mypage_summary_divider} aria-hidden='true' />
            <span className={`${styles.mypage_summary_github} font_body_s_r`}>{PROFILE.github}</span>
          </p>
        </div>

        <div className={styles.mypage_summary_stats}>
          {STATS.map((stat) => (
            <span key={stat.label} className={styles.mypage_summary_stat}>
              <span className={`${styles[`mypage_summary_value_${stat.tone}`]} font_h3`}>
                {stat.value}
              </span>
              <span className={`${styles.mypage_summary_label} font_body_s_r`}>{stat.label}</span>
            </span>
          ))}
        </div>
      </section>

      <ProfileSection title='자기소개'>
        <p className={`${styles.mypage_bio} font_body_m_r`}>{PROFILE.bio}</p>
      </ProfileSection>

      <ProfileSection title='학력'>
        <div className={styles.mypage_rows}>
          {EDUCATIONS.map((item) => (
            <InfoRow key={item.title} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='경력'>
        <div className={styles.mypage_rows}>
          {CAREERS.map((item) => (
            <InfoRow key={item.title} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='언어'>
        <div className={styles.mypage_rows}>
          {LANGUAGES.map((item) => (
            <InfoRow key={item.title} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='수상 내역'>
        <div className={styles.mypage_awards}>
          {AWARDS.map((item, index) => (
            <AwardRow key={item.title} rank={index + 1} title={item.title} date={item.date} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='기술 스택'>
        <ul className={styles.mypage_skills}>
          {SKILLS.map((label) => (
            <LogoItem key={label} label={label} />
          ))}
        </ul>
      </ProfileSection>

      <ProfileSection title='관심 회사'>
        <ul className={styles.mypage_companies}>
          {COMPANIES.map((label) => (
            <LogoItem key={label} label={label} />
          ))}
        </ul>
      </ProfileSection>

      <ProfileSection title='관심 분야'>
        <ul className={styles.mypage_interests}>
          {INTERESTS.map((label) => (
            <li key={label} className={`${styles.mypage_interest} font_body_m_b`}>
              {label}
            </li>
          ))}
        </ul>
      </ProfileSection>
    </>
  );
}
