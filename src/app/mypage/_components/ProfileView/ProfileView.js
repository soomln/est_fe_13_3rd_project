import Link from 'next/link';

import ProfileSection from '@/app/mypage/_components/ProfileSection';
import InfoRow from '@/app/mypage/_components/InfoRow';
import AwardRow from '@/app/mypage/_components/AwardRow';
import LogoItem from '@/app/mypage/_components/LogoItem';
import styles from './ProfileView.module.sass';

export default function ProfileView({ profile }) {
  const { stats, educations, careers, languages, awards, skills, companies, interests } = profile;

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

      <ProfileSection title='자기소개'>
        <p className={`${styles.profile_view_bio} font_body_m_r`}>{profile.bio}</p>
      </ProfileSection>

      <ProfileSection title='학력'>
        <div className={styles.profile_view_rows}>
          {educations.map((item) => (
            <InfoRow key={item.title} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='경력'>
        <div className={styles.profile_view_rows}>
          {careers.map((item) => (
            <InfoRow key={item.title} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='언어'>
        <div className={styles.profile_view_rows}>
          {languages.map((item) => (
            <InfoRow key={item.title} {...item} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='수상 내역'>
        <div className={styles.profile_view_awards}>
          {awards.map((item, index) => (
            <AwardRow key={item.title} rank={index + 1} title={item.title} date={item.date} />
          ))}
        </div>
      </ProfileSection>

      <ProfileSection title='기술 스택'>
        <ul className={styles.profile_view_skills}>
          {skills.map((label) => (
            <LogoItem key={label} label={label} />
          ))}
        </ul>
      </ProfileSection>

      <ProfileSection title='관심 회사'>
        <ul className={styles.profile_view_companies}>
          {companies.map((label) => (
            <LogoItem key={label} label={label} />
          ))}
        </ul>
      </ProfileSection>

      <ProfileSection title='관심 분야'>
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
