import AccountPanel from '@/app/mypage/account/_components/AccountPanel';

// 주의: supabase 연결 전까지 쓰는 임시 값
const ACCOUNT = {
  email: 'honggildong@gmail.com',
  joinedAt: '2026. 07. 30',
  avatarUrl: '',
};

export default function Account() {
  return <AccountPanel account={ACCOUNT} />;
}
