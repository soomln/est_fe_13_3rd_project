import { Suspense } from 'react';
import Link from 'next/link';

import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import FreeFormBrowser from '@/app/resume/free-form/_components/FreeFormBrowser';
import styles from './page.module.sass';

// 주의: supabase 연결 전까지 쓰는 임시 목록. 배열 순서가 등록 최신순
const TEMPLATES = [
  { id: 'resume-bootcamp', title: '부트캠프 수료 이력서', docType: 'resume', views: 740 },
  { id: 'cover-intern', title: '인턴 지원 자기소개서', docType: 'cover_letter', views: 680 },
  { id: 'resume-data', title: '데이터 분석가 이력서', docType: 'resume', views: 860 },
  { id: 'cover-motivation', title: '지원 동기 중심 자기소개서', docType: 'cover_letter', views: 930 },
  { id: 'resume-backend', title: '백엔드 개발자 이력서', docType: 'resume', views: 1120 },
  { id: 'resume-frontend', title: '프론트엔드 개발자 이력서', docType: 'resume', views: 1180 },
  { id: 'resume-intern', title: '인턴 지원 이력서', docType: 'resume', views: 1240 },
  { id: 'cover-growth', title: '성장 과정 중심 자기소개서', docType: 'cover_letter', views: 1090 },
  { id: 'resume-english', title: '영문 이력서 (English Resume)', docType: 'resume', views: 980 },
  { id: 'resume-standard', title: '국문 표준 이력서', docType: 'resume', views: 1320 },
  { id: 'cover-project', title: '프로젝트 경험 중심 자기소개서', docType: 'cover_letter', views: 1450 },
  { id: 'resume-portfolio', title: '포트폴리오형 이력서', docType: 'resume', views: 1640 },
  { id: 'cover-competency', title: '직무 역량 중심 자기소개서', docType: 'cover_letter', views: 1710 },
  { id: 'resume-project', title: '프로젝트 중심 이력서', docType: 'resume', views: 1980 },
  { id: 'cover-career', title: '경력 자기소개서', docType: 'cover_letter', views: 2050 },
  { id: 'resume-career', title: '경력 개발자 이력서', docType: 'resume', views: 2410 },
  { id: 'cover-newcomer', title: '신입 자기소개서', docType: 'cover_letter', views: 2760 },
  { id: 'resume-newcomer', title: '신입 개발자 이력서', docType: 'resume', views: 2870 },
  { id: 'cover-basic', title: '기본 자기소개서', docType: 'cover_letter', views: 3120 },
  { id: 'resume-basic', title: '기본 이력서', docType: 'resume', views: 3290 },
];

export default function FreeForm() {
  return (
    <>
      <Header />
      <main className='container'>
        <div className={styles.free_form_head}>
          <div className={styles.free_form_intro}>
            <span className={`${styles.free_form_badge} font_body_m_b`}>양식 선택하고 편집하기</span>

            <h1 className={`${styles.free_form_title} font_subtitle`}>무료 양식 모음</h1>

            <p className={`${styles.free_form_desc} font_body_l_r`}>
              이력서부터 자기소개서까지, 원하는 양식을 골라 바로 시작해보세요.
            </p>
          </div>

          <Link href='/mypage/documents' className={`${styles.free_form_docs_btn} font_h4`}>
            내 문서함
          </Link>
        </div>

        <Suspense>
          <FreeFormBrowser templates={TEMPLATES} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
