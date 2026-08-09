'use client';

import Link from 'next/link';

import ProfileSection from '@/app/mypage/_components/ProfileSection';
import TextField from '@/app/mypage/_components/TextField';
import ToggleGroup from '@/app/mypage/_components/ToggleGroup';
import InterestChip from '@/app/mypage/_components/InterestChip';
import LogoItem from '@/app/mypage/_components/LogoItem';
import styles from './ProfileEdit.module.sass';

const CAREER_LEVELS = ['신입', '1~3년', '3~5년', '5년 이상'];
const EDU_STATES = ['졸업', '재학 중', '휴학', '중퇴'];
const LANGUAGE_LEVELS = ['상', '중', '하'];

// 주의: supabase 연결 전까지 쓰는 임시 목록
const INTERESTS = [
  '프론트엔드',
  '백엔드',
  '풀스택',
  '모바일',
  '데이터',
  'AI · ML',
  'DevOps',
  '보안',
  '웹 접근성',
  '기획',
  '디자인',
];

const SELECTED_INTERESTS = ['프론트엔드', '웹 접근성'];

export default function ProfileEdit({ profile }) {
  const { educations, careers, languages, awards, skills, companies } = profile;

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
          <Link href='/mypage' className={`${styles.profile_edit_cancel} font_body_l_b`}>
            수정 취소
          </Link>
          <Link href='/mypage' className={`${styles.profile_edit_save} font_body_l_b`}>
            <span className='material-symbols-sharp' aria-hidden='true'>
              check
            </span>
            수정 완료
          </Link>
        </div>
      </div>

      <p className={`${styles.profile_edit_notice} font_body_m_b`} role='status'>
        <span className='material-symbols-sharp' aria-hidden='true'>
          info
        </span>
        수정 모드입니다. 수정한 뒤 우측 상단 “수정 완료”를 눌러주세요.
      </p>

      <section className={styles.profile_edit_basic}>
        <div className={styles.profile_edit_avatar_box}>
          <span className={styles.profile_edit_avatar} />
          <button type='button' className={`${styles.profile_edit_avatar_btn} font_body_s_b`}>
            사진 변경
          </button>
        </div>

        <div className={styles.profile_edit_grid}>
          <TextField label='이름' defaultValue={profile.name} />
          <TextField label='희망 직무' defaultValue='프론트엔드 개발자' />
          <TextField label='경력 구분' options={CAREER_LEVELS} defaultValue='신입' />
          <TextField label='링크 (선택)' defaultValue={profile.github} />
        </div>
      </section>

      <ProfileSection title='자기소개' hideEdit>
        <TextField
          rows={7}
          defaultValue={profile.bio}
          aria-label='자기소개'
          placeholder='어떤 문제를 어떻게 해결했는지 적어보세요.'
        />
        <p className={styles.profile_edit_foot}>
          <span className={`${styles.profile_edit_hint} font_body_s_b`}>
            어떤 문제를 어떻게 해결했는지 한 문장이라도 넣으면 좋아요.
          </span>
          <span className={`${styles.profile_edit_count} font_body_s_b`}>
            {profile.bio.length} / 1000
          </span>
        </p>
      </ProfileSection>

      <ProfileSection title='학력' hideEdit>
        {educations.map((item) => (
          <div key={item.title} className={styles.profile_edit_rows}>
            <div className={styles.profile_edit_row}>
              <TextField label='학교명' defaultValue={item.title} />
              <TextField label='전공' defaultValue={item.sub} />
              <div className={styles.profile_edit_col_narrow}>
                <TextField label='상태' options={EDU_STATES} defaultValue={item.badge} />
              </div>
            </div>

            <div className={styles.profile_edit_row}>
              <TextField label='입학' defaultValue='2020.03' />
              <TextField label='졸업' defaultValue='2024.02' />
            </div>
          </div>
        ))}
      </ProfileSection>

      <ProfileSection title='경력' hideEdit>
        <div className={styles.profile_edit_table}>
          <div className={styles.profile_edit_table_head}>
            <span className={`${styles.profile_edit_col_date} font_body_s_b`}>시작</span>
            <span className={`${styles.profile_edit_col_date} font_body_s_b`}>종료</span>
            <span className={`${styles.profile_edit_col_wide} font_body_s_b`}>회사명</span>
            <span className={`${styles.profile_edit_col_wide} font_body_s_b`}>직무</span>
            <span className={styles.profile_edit_col_del} />
          </div>

          {careers.map((item) => (
            <div key={item.title} className={styles.profile_edit_table_row}>
              <div className={styles.profile_edit_col_date}>
                <TextField aria-label='시작' defaultValue={item.meta.split(' – ')[0]} />
              </div>
              <div className={styles.profile_edit_col_date}>
                <TextField aria-label='종료' defaultValue={item.meta.split(' – ')[1]} />
              </div>
              <div className={styles.profile_edit_col_wide}>
                <TextField aria-label='회사명' defaultValue={item.title} />
              </div>
              <div className={styles.profile_edit_col_wide}>
                <TextField aria-label='직무' defaultValue={item.sub} />
              </div>
              <button
                type='button'
                className={styles.profile_edit_col_del}
                aria-label={`${item.title} 삭제`}
              >
                <span className='material-symbols-sharp' aria-hidden='true'>
                  close
                </span>
              </button>
            </div>
          ))}

          <button type='button' className={`${styles.profile_edit_add} font_body_m_b`}>
            <span className='material-symbols-sharp' aria-hidden='true'>
              add
            </span>
            경력 추가
          </button>

          <p className={`${styles.profile_edit_hint} font_body_s_b`}>
            기간은 YYYY.MM 형식으로, 현재 재직 중이면 종료란에 “재직 중”이라고 적어주세요.
          </p>
        </div>
      </ProfileSection>

      <ProfileSection title='언어' hideEdit>
        <div className={styles.profile_edit_langs}>
          {languages.map((item) => (
            <div key={item.title} className={styles.profile_edit_lang}>
              <div className={styles.profile_edit_lang_head}>
                <span className={`${styles.profile_edit_lang_name} font_body_l_b`}>
                  {item.title}
                </span>
                <button
                  type='button'
                  className={styles.profile_edit_col_del}
                  aria-label={`${item.title} 삭제`}
                >
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    close
                  </span>
                </button>
              </div>

              <ToggleGroup
                options={LANGUAGE_LEVELS}
                defaultValue={item.badge}
                label={`${item.title} 수준`}
              />

              <TextField aria-label={`${item.title} 설명`} defaultValue={item.sub} />
            </div>
          ))}
        </div>

        <TextField label='언어 검색 · 목록에서 선택' placeholder='언어를 검색해보세요' />
      </ProfileSection>

      <ProfileSection title='수상 내역' hideEdit>
        <div className={styles.profile_edit_table}>
          <div className={styles.profile_edit_table_head}>
            <span className={`${styles.profile_edit_col_date} font_body_s_b`}>수상일</span>
            <span className={`${styles.profile_edit_col_full} font_body_s_b`}>수상명</span>
            <span className={styles.profile_edit_col_del} />
          </div>

          {awards.map((item) => (
            <div key={item.title} className={styles.profile_edit_table_row}>
              <div className={styles.profile_edit_col_date}>
                <TextField aria-label='수상일' defaultValue={item.date} />
              </div>
              <div className={styles.profile_edit_col_full}>
                <TextField aria-label='수상명' defaultValue={item.title} />
              </div>
              <button
                type='button'
                className={styles.profile_edit_col_del}
                aria-label={`${item.title} 삭제`}
              >
                <span className='material-symbols-sharp' aria-hidden='true'>
                  close
                </span>
              </button>
            </div>
          ))}

          <button type='button' className={`${styles.profile_edit_add} font_body_m_b`}>
            <span className='material-symbols-sharp' aria-hidden='true'>
              add
            </span>
            수상 내역 추가
          </button>
        </div>
      </ProfileSection>

      <ProfileSection title='기술 스택' hideEdit>
        <ul className={styles.profile_edit_logos}>
          {skills.map((label) => (
            <LogoItem key={label} label={label} onRemove={() => {}} />
          ))}
        </ul>

        <TextField label='기술 검색 · 목록에서 선택' placeholder='기술을 검색해보세요' />
      </ProfileSection>

      <ProfileSection title='관심 회사' hideEdit>
        <ul className={styles.profile_edit_logos}>
          {companies.map((label) => (
            <LogoItem key={label} label={label} onRemove={() => {}} />
          ))}
        </ul>

        <TextField label='회사 검색 · 목록에서 선택' placeholder='회사를 검색해보세요' />
      </ProfileSection>

      <ProfileSection title='관심 분야' hideEdit>
        <p className={`${styles.profile_edit_hint} font_body_s_b`}>
          목록에서 선택하세요. 여러 개 선택할 수 있어요.
        </p>

        <div className={styles.profile_edit_chips}>
          {INTERESTS.map((label) => (
            <InterestChip
              key={label}
              label={label}
              defaultSelected={SELECTED_INTERESTS.includes(label)}
            />
          ))}
        </div>
      </ProfileSection>
    </>
  );
}
