'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useMyProfile } from '@/app/mypage/_components/MyProfileProvider';
import { toPatch, validate, fillMissingEducations } from '@/app/mypage/_lib/profileMap';
import techIcon from '@/app/mypage/_lib/techIcon';
import Toast from '@/app/mypage/_components/Toast';
import UnsavedGuard from '@/app/mypage/_components/UnsavedGuard';
import ProfileSection from '@/app/mypage/_components/ProfileSection';
import ProfileForm from '@/app/mypage/_components/ProfileForm';
import BasicFields from '@/app/mypage/_components/ProfileEdit/BasicFields';
import InfoRow from '@/app/mypage/_components/InfoRow';
import AwardRow from '@/app/mypage/_components/AwardRow';
import LogoItem from '@/app/mypage/_components/LogoItem';
import styles from './ProfileView.module.sass';

export default function ProfileView({ profile }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { codes, saveProfile } = useMyProfile();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);
  const [toast, setToast] = useState({ message: '', tone: 'done', id: 0 });

  // 같은 문구를 다시 띄워도 새로 보이도록 번호를 올린다
  const showToast = (message, tone = 'done') =>
    setToast((prev) => ({ message, tone, id: prev.id + 1 }));
  const [problem, setProblem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 전체 수정 화면에서 저장하고 돌아오면 여기서 알림을 띄운다
  useEffect(() => {
    if (searchParams.get('saved') !== '1') return;
    showToast('저장되었습니다');
    router.replace(pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  const { stats, educations, careers, languages, awards, skills, interests } = profile;

  // 수정 모드가 열려 있으면 나가기를 막는다
  const isDirty = editing !== null;

  const skillCodeOf = (label) =>
    (codes.tech_stack ?? []).find((item) => item.label === label)?.code;

  // 한 번에 한 섹션만 연다. 다른 섹션을 열면 이전 수정은 버린다
  const startEdit = (section) => {
    setEditing(section);
    setDraft(profile);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft(null);
    setProblem(null);
  };

  const saveEdit = async () => {
    if (isSaving) return;

    const found = validate(editing, draft);

    if (found) {
      // 최종학력에 필요한 줄을 지웠으면 되살려서 보여준다
      if (found.missing) setDraft(fillMissingEducations(draft));
      setProblem(found);
      showToast(found.message, 'error');
      return;
    }

    setIsSaving(true);

    try {
      await saveProfile(toPatch(editing, draft, codes));
      cancelEdit();
      showToast('저장되었습니다');
    } catch {
      showToast('저장하지 못했어요. 잠시 뒤 다시 시도해주세요.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // 섹션마다 같은 prop 묶음이 들어가서 한 곳에서 만든다
  const sectionProps = (section) => ({
    isEditing: editing === section,
    isSaving,
    isLocked: editing !== null && editing !== section,
    onEdit: () => startEdit(section),
    onCancel: cancelEdit,
    onSave: saveEdit,
    editChildren: (
      <ProfileForm
        section={section}
        draft={draft}
        onChange={setDraft}
        errorFields={problem?.fields ?? {}}
      />
    ),
  });

  return (
    <>
      <div className={styles.profile_view_head}>
        <div className={styles.profile_view_head_text}>
          <h1 className={`${styles.profile_view_head_title} font_h1`}>프로필</h1>
          <p className={`${styles.profile_view_head_desc} font_body_m_r`}>
            서류와 면접 준비에 함께 쓰이는 내 기본 정보예요.
          </p>
        </div>

        <Link href='/mypage?mode=edit' className={`${styles.profile_view_head_btn} font_body_l_b`}>
          <span className='material-symbols-sharp' aria-hidden='true'>
            edit
          </span>
          프로필 수정
        </Link>
      </div>

      {editing === 'basic' ? (
        <section className={styles.profile_view_basic}>
          <div className={styles.profile_view_basic_head}>
            <h2 className={`${styles.profile_view_basic_title} font_h3`}>기본 정보</h2>

            <div className={styles.profile_view_basic_actions}>
              <button
                type='button'
                className={`${styles.profile_view_basic_cancel} font_body_l_b`}
                onClick={cancelEdit}
              >
                취소
              </button>
              <button
                type='button'
                className={`${styles.profile_view_basic_save} font_body_l_b`}
                disabled={isSaving}
                onClick={saveEdit}
              >
                {isSaving ? '저장 중…' : '저장'}
              </button>
            </div>
          </div>

          <BasicFields
            draft={draft}
            onChange={setDraft}
            hasNameError={problem?.fields?.[0]?.name === 'blank'}
            onPhotoError={(message) => showToast(message, 'error')}
          />
        </section>
      ) : (
      <section className={styles.profile_view_summary}>
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt='' className={styles.profile_view_summary_avatar} />
        ) : (
          <span className={styles.profile_view_summary_avatar} />
        )}

        <div className={styles.profile_view_summary_text}>
          <p className={`${styles.profile_view_summary_name} font_h1`}>{profile.name}</p>
          <p className={`${styles.profile_view_summary_headline} font_body_l_r`}>{profile.headline}</p>

          <p className={styles.profile_view_summary_contact}>
            <span className={`${styles.profile_view_summary_email} font_body_s_r`}>{profile.email}</span>
            <span className={styles.profile_view_summary_divider} aria-hidden='true' />
            <span className={`${styles.profile_view_summary_github} font_body_s_r`}>{profile.github}</span>
          </p>
        </div>

        <div className={styles.profile_view_summary_stats}>
          {stats.map((stat) => (
            <span key={stat.label} className={styles.profile_view_summary_stat}>
              <span className={`${styles[`profile_view_summary_value_${stat.tone}`]} font_h3`}>
                {stat.value}
              </span>
              <span className={`${styles.profile_view_summary_label} font_body_s_r`}>{stat.label}</span>
            </span>
          ))}
        </div>

        <button
          type='button'
          className={`${styles.profile_view_summary_edit} font_body_l_b`}
          disabled={editing !== null}
          title={editing !== null ? '수정 중인 섹션을 먼저 저장하거나 취소해주세요' : undefined}
          onClick={() => startEdit('basic')}
        >
          수정
        </button>
      </section>
      )}

      <UnsavedGuard isDirty={isDirty} />

      <Toast
        key={toast.id}
        message={toast.message}
        tone={toast.tone}
        onHide={() => setToast((prev) => ({ ...prev, message: '' }))}
      />

      <ProfileSection title='자기소개' {...sectionProps('bio')}>
        <p className={`${styles.profile_view_bio} font_body_m_r`}>{profile.bio}</p>
      </ProfileSection>

      <ProfileSection title='학력' {...sectionProps('educations')}>
        <div className={styles.profile_view_rows}>
          {educations.map((item, index) => (
            <InfoRow key={index} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='경력' {...sectionProps('careers')}>
        <div className={styles.profile_view_rows}>
          {careers.map((item, index) => (
            <InfoRow key={index} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='언어' {...sectionProps('languages')}>
        <div className={styles.profile_view_rows}>
          {languages.map((item, index) => (
            <InfoRow key={index} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='수상 내역' {...sectionProps('awards')}>
        <div className={styles.profile_view_awards}>
          {awards.map((item, index) => (
            <AwardRow key={index} rank={index + 1} title={item.title} date={item.date} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='기술 스택' {...sectionProps('skills')}>
        <ul className={styles.profile_view_skills}>
          {skills.map((label) => (
            <LogoItem key={label} label={label} icon={techIcon(skillCodeOf(label))} />
          ))}
        </ul>
      </ProfileSection>

      <ProfileSection title='관심 분야' {...sectionProps('interests')}>
        <ul className={styles.profile_view_interests}>
          {interests.map((label) => (
            <li key={label} className={`${styles.profile_view_interest} font_body_m_b`}>
              {label}
            </li>
          ))}
        </ul>
      </ProfileSection>
    </>
  );
}
