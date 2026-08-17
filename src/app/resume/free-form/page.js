import { Suspense } from 'react';
import Link from 'next/link';

import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import FreeFormBrowser from '@/app/resume/free-form/_components/FreeFormBrowser';
import styles from './page.module.sass';

export default function FreeForm() {
  return (
    <>
      <Header />
      <main className='container'>
        <div className={styles.free_form_head}>
          <div className={styles.free_form_intro}>
            <span className={`${styles.free_form_badge} font_body_s_b`}>양식 선택하고 편집하기</span>

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
          <FreeFormBrowser />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
