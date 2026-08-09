import ProfileView from '@/app/mypage/_components/ProfileView';
import ProfileEdit from '@/app/mypage/_components/ProfileEdit';

// 주의: supabase 연결 전까지 쓰는 임시 정보
const PROFILE = {
  name: '홍길동',
  headline: '프론트엔드 개발자 · 신입',
  email: 'honggildong@email.com',
  github: 'github.com/honggildong',
  avatarUrl: '',
  bio: '사용자가 겪는 불편을 화면 단위로 쪼개서 해결하는 일을 좋아하는 프론트엔드 개발자입니다. 부트캠프에서 6개월간 3개의 팀 프로젝트를 진행하며 React와 상태 관리, 그리고 협업 과정에서의 커뮤니케이션을 배웠습니다. 특히 팀 프로젝트에서 갈등이 생겼을 때 먼저 이야기를 꺼내 조율하는 역할을 자주 맡았고, 그 과정에서 기록과 문서화의 중요함을 크게 느꼈습니다.',

  stats: [
    { value: 4, label: '문서', tone: 'black' },
    { value: 3, label: '포트폴리오', tone: 'green' },
    { value: 6, label: '면접 스크랩', tone: 'amber' },
  ],

  educations: [
    { title: '서울개발대학교', sub: '소프트웨어학과', meta: '2020.03 – 2024.02', badge: '졸업' },
  ],

  careers: [
    { title: '이스트소프트', sub: '프론트엔드 개발자', meta: '2025.03 – 현재', badge: '재직 중' },
    {
      title: '이스트시큐리티',
      sub: '웹 퍼블리싱',
      meta: '2024.07 – 2025.02',
      badge: '퇴사',
      badgeTone: 'plain',
    },
  ],

  languages: [
    { title: '영어', sub: '비즈니스 회화 가능 · OPIc IH', badge: '상' },
    { title: '일본어', sub: '일상 회화 가능', badge: '중' },
  ],

  awards: [
    { title: '부트캠프 최종 프로젝트 대상', date: '2026.01' },
    { title: '교내 해커톤 우수상', date: '2026.01' },
  ],

  skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Java', 'Git'],
  companies: ['XX컴퍼니', 'OO테크', '△△랩스', '□□소프트', '◇◇스튜디오'],
  interests: ['프론트엔드', '웹 접근성'],
};

export default async function MyPage({ searchParams }) {
  const { mode } = await searchParams;

  return mode === 'edit' ? <ProfileEdit profile={PROFILE} /> : <ProfileView profile={PROFILE} />;
}
