'use client';

import { useState } from 'react';
import Link from 'next/link';

import ProfileSection from '@/app/mypage/_components/ProfileSection';
import ProfileForm from '@/app/mypage/_components/ProfileForm';
import InfoRow from '@/app/mypage/_components/InfoRow';
import AwardRow from '@/app/mypage/_components/AwardRow';
import LogoItem from '@/app/mypage/_components/LogoItem';
import styles from './ProfileView.module.sass';

// 주의: supabase 연결 전까지는 화면에만 반영된다. 새로고침하면 되돌아간다
export default function ProfileView({ profile: initialProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(null);

  const { stats, educations, careers, languages, awards, skills, companies, interests } = profile;

  // 한 번에 한 섹션만 연다. 다른 섹션을 열면 이전 수정은 버린다
  const startEdit = (section) => {
    setEditing(section);
    setDraft(profile);
  };

  const cancelEdit = () => {
    setEditing(null);
    setDraft(null);
  };

  const saveEdit = () => {
    setProfile(draft);
    cancelEdit();
  };

  // 섹션마다 같은 prop 묶음이 들어가서 한 곳에서 만든다
  const sectionProps = (section) => ({
    isEditing: editing === section,
    onEdit: () => startEdit(section),
    onCancel: cancelEdit,
    onSave: saveEdit,
    editChildren: <ProfileForm section={section} draft={draft} onChange={setDraft} />,
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
      </section>

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
            <LogoItem key={label} label={label} />
          ))}
        </ul>
      </ProfileSection>

      <ProfileSection title='관심 회사' {...sectionProps('companies')}>
        <ul className={styles.profile_view_companies}>
          {companies.map((label) => (
            <LogoItem key={label} label={label} />
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
