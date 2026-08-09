import { Suspense } from 'react';

import DocumentBrowser from '@/app/mypage/documents/_components/DocumentBrowser';

// 주의: supabase 연결 전까지 쓰는 임시 목록. 배열 순서가 등록순
const DOCUMENTS = [
  { id: 'doc-01', docType: 'resume', title: '이스트소프트_이력서_진짜진짜최종.pdf', updatedAt: '2026.07.26' },
  { id: 'doc-02', docType: 'cover_letter', title: '이스트소프트_자기소개서_진짜진짜최종.pdf', updatedAt: '2026.07.26' },
  { id: 'doc-03', docType: 'resume', title: '이스트소프트_이력서_다시이게최종.pdf', updatedAt: '2026.07.25' },
  { id: 'doc-04', docType: 'cover_letter', title: '이스트소프트_자기소개서_찐최종.pdf', updatedAt: '2026.07.25' },
  { id: 'doc-05', docType: 'resume', title: '이스트소프트_이력서_이게진짜최종.pdf', updatedAt: '2026.07.24' },
  { id: 'doc-06', docType: 'cover_letter', title: '이스트소프트_자기소개서.pdf', updatedAt: '2026.07.24' },
  { id: 'doc-07', docType: 'resume', title: '이스트소프트_이력서.pdf', updatedAt: '2026.07.23' },
  { id: 'doc-08', docType: 'cover_letter', title: '카카오_자기소개서.pdf', updatedAt: '2026.07.22' },
  { id: 'doc-09', docType: 'resume', title: '카카오_이력서.pdf', updatedAt: '2026.07.22' },
  { id: 'doc-10', docType: 'cover_letter', title: '네이버_자기소개서.pdf', updatedAt: '2026.07.21' },
  { id: 'doc-11', docType: 'resume', title: '네이버_이력서.pdf', updatedAt: '2026.07.20' },
  { id: 'doc-12', docType: 'cover_letter', title: '토스_자기소개서.pdf', updatedAt: '2026.07.19' },
  { id: 'doc-13', docType: 'resume', title: '토스_이력서.pdf', updatedAt: '2026.07.18' },
  { id: 'doc-14', docType: 'resume', title: '영문_이력서.pdf', updatedAt: '2026.07.17' },
];

export default function Documents() {
  return (
    <Suspense>
      <DocumentBrowser documents={DOCUMENTS} />
    </Suspense>
  );
}
