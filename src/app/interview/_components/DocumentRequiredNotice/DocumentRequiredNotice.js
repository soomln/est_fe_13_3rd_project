'use client';

import { useRouter } from 'next/navigation';
import styles from './DocumentRequiredNotice.module.sass';
import QuestionListButton from '../QuestionListButton';

export default function DocumentRequiredNotice({
  hasResume,
  hasCoverLetter,
}) {
  const router = useRouter();

  const title = !hasResume && !hasCoverLetter
    ? '아직 등록된 이력서와 자기소개서가 없습니다.'
    : !hasResume
      ? '아직 등록된 이력서가 없습니다.'
      : '아직 등록된 자기소개서가 없습니다.';

  const description = !hasResume && !hasCoverLetter
    ? 'AI 면접을 시작하려면 먼저 이력서와 자기소개서를 작성해주세요.'
    : !hasResume
      ? 'AI 면접을 시작하려면 이력서를 먼저 작성해주세요.'
      : 'AI 면접을 시작하려면 자기소개서를 먼저 작성해주세요.';

  return (
    <aside className={styles.document_required_notice}>
      <h2 className="font_h4">
        {title}
      </h2>

      <p className="font_body_m_r">
        {description}
      </p>

      <div className={styles.notice_actions}>
        {!hasResume && (
          <QuestionListButton
            onClick={() => router.push('/resume/free-form?docType=resume')}
          >
            이력서 작성하기
          </QuestionListButton>
        )}

        {!hasCoverLetter && (
          <QuestionListButton
            onClick={() => router.push('/resume/free-form?docType=cover_letter')}
          >
            자기소개서 작성하기
          </QuestionListButton>
        )}
      </div>
    </aside>
  );
}
