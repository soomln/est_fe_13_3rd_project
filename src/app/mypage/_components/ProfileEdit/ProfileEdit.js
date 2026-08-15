'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useMyProfile } from '@/app/mypage/_components/MyProfileProvider';
import { toPatch, validate, fillMissingEducations } from '@/app/mypage/_lib/profileMap';
import Toast from '@/app/mypage/_components/Toast';
import UnsavedGuard from '@/app/mypage/_components/UnsavedGuard';
import ProfileSection from '@/app/mypage/_components/ProfileSection';
import ProfileForm from '@/app/mypage/_components/ProfileForm';
import BasicFields from './BasicFields';
import styles from './ProfileEdit.module.sass';

// 섹션별 수정과 같은 입력 폼을 한 화면에 모아 한꺼번에 저장한다
const SECTIONS = [
  { key: 'bio', title: '자기소개' },
  { key: 'educations', title: '학력' },
  { key: 'careers', title: '경력' },
  { key: 'languages', title: '언어' },
  { key: 'awards', title: '수상 내역' },
  { key: 'skills', title: '기술 스택' },
  { key: 'interests', title: '관심 분야' },
];

export default function ProfileEdit({ profile }) {
  const router = useRouter();
  const { codes, saveProfile } = useMyProfile();
  const [draft, setDraft] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ message: '', tone: 'done', id: 0 });

  const showToast = (message, tone = 'done') =>
    setToast((prev) => ({ message, tone, id: prev.id + 1 }));
  const [errors, setErrors] = useState({});

  // 전체 수정 화면은 들어와 있는 것 자체가 수정 중이다
  const isDirty = !isSaving;

  const handleSave = async () => {
    const found = ['basic', ...SECTIONS.map((section) => section.key)]
      .map((key) => [key, validate(key, draft)])
      .filter(([, problem]) => problem);

    if (found.length > 0) {
      const [firstKey, first] = found[0];
      if (first.missing) setDraft(fillMissingEducations(draft));
      setErrors(Object.fromEntries(found.map(([key, problem]) => [key, problem])));
      showToast(first.message, 'error');
      document.getElementById(`section-${firstKey}`)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setIsSaving(true);
    setErrors({});

    const patch = ['basic', ...SECTIONS.map((section) => section.key)].reduce(
      (acc, key) => ({ ...acc, ...toPatch(key, draft, codes) }),
      {},
    );

    try {
      await saveProfile(patch);
      router.push('/mypage?saved=1');
    } catch {
      showToast('저장하지 못했어요. 잠시 뒤 다시 시도해주세요.', 'error');
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={styles.profile_edit_head}>
        <div className={styles.profile_edit_head_text}>
          <h1 className={`${styles.profile_edit_head_title} font_h1`}>프로필</h1>
          <p className={`${styles.profile_edit_head_desc} font_body_m_r`}>
            여기서 채운 정보로 이력서를 자동으로 채울 수 있어요.
          </p>
        </div>

        <div className={styles.profile_edit_actions}>
          <button
            type='button'
            className={`${styles.profile_edit_cancel} font_body_l_b`}
            onClick={() => router.push('/mypage')}
          >
            수정 취소
          </button>

          <button
            type='button'
            className={`${styles.profile_edit_save} font_body_l_b`}
            disabled={isSaving}
            onClick={handleSave}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              check
            </span>
            {isSaving ? '저장 중…' : '수정 완료'}
          </button>
        </div>
      </div>

      <p className={`${styles.profile_edit_notice} font_body_m_b`} role='status'>
        <span className='material-symbols-sharp' aria-hidden='true'>
          info
        </span>
        수정 모드입니다. 수정한 뒤 우측 상단 “수정 완료”를 눌러주세요.
      </p>

      <UnsavedGuard isDirty={isDirty} />

      <Toast
        key={toast.id}
        message={toast.message}
        tone={toast.tone}
        onHide={() => setToast((prev) => ({ ...prev, message: '' }))}
      />

      <BasicFields
        draft={draft}
        onChange={setDraft}
        hasNameError={errors.basic?.fields?.[0]?.name === 'blank'}
        onPhotoError={(message) => showToast(message, 'error')}
      />

      {SECTIONS.map((section) => (
        <div key={section.key} id={`section-${section.key}`}>
          <ProfileSection title={section.title} hideEdit>
            <ProfileForm
              section={section.key}
              draft={draft}
              onChange={setDraft}
              errorFields={errors[section.key]?.fields ?? {}}
            />
          </ProfileSection>
        </div>
      ))}
    </>
  );
}
