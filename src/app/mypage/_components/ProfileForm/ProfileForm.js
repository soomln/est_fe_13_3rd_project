'use client';

import { useState } from 'react';

import TextField from '@/app/mypage/_components/TextField';
import ToggleGroup from '@/app/mypage/_components/ToggleGroup';
import InterestChip from '@/app/mypage/_components/InterestChip';
import LogoItem from '@/app/mypage/_components/LogoItem';
import styles from './ProfileForm.module.sass';

const EDU_STATES = ['졸업', '재학 중', '휴학', '중퇴'];

// 학교 구분. 순서대로 정렬한다
const SCHOOL_LEVELS = ['고등학교', '전문대', '대학교', '대학원'];

// 최종학력을 고르면 이 구분들이 채워진다. 백엔드 education_level 코드와 같은 이름
const FINAL_EDUCATIONS = {
  고졸: ['고등학교'],
  초대졸: ['고등학교', '전문대'],
  대졸: ['고등학교', '대학교'],
  석사: ['고등학교', '대학교', '대학원'],
  박사: ['고등학교', '대학교', '대학원'],
};
const CAREER_STATES = ['재직 중', '퇴사'];
const LANGUAGE_LEVELS = ['상', '중', '하'];
const BIO_MAX = 1000;

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

// meta 는 "2020.03 – 2024.02" 형태로 저장한다
const splitMeta = (meta = '') => meta.split(' – ');
const joinMeta = (from, to) => `${from} – ${to}`;

function RowActions({ onAdd, addLabel }) {
  return (
    <button type='button' className={`${styles.profile_form_add} font_body_m_b`} onClick={onAdd}>
      <span className='material-symbols-sharp' aria-hidden='true'>
        add
      </span>
      {addLabel}
    </button>
  );
}

function ChipAdder({ placeholder, onAdd }) {
  const [text, setText] = useState('');

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onAdd(value);
    setText('');
  };

  return (
    <div className={styles.profile_form_adder}>
      <TextField
        aria-label={placeholder}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          submit();
        }}
      />
      <button type='button' className={`${styles.profile_form_add} font_body_m_b`} onClick={submit}>
        추가
      </button>
    </div>
  );
}

// 섹션마다 다른 편집 폼. draft 를 직접 고치지 않고 onChange 로 통째로 넘긴다
export default function ProfileForm({ section, draft, onChange }) {
  const patch = (key, value) => onChange({ ...draft, [key]: value });

  const patchList = (key, index, next) =>
    patch(
      key,
      draft[key].map((item, i) => (i === index ? next : item)),
    );

  const removeAt = (key, index) =>
    patch(
      key,
      draft[key].filter((_, i) => i !== index),
    );

  if (section === 'bio') {
    return (
      <>
        <TextField
          rows={7}
          aria-label='자기소개'
          placeholder='어떤 문제를 어떻게 해결했는지 적어보세요.'
          maxLength={BIO_MAX}
          value={draft.bio}
          onChange={(event) => patch('bio', event.target.value)}
        />
        <p className={styles.profile_form_foot}>
          <span className={`${styles.profile_form_hint} font_body_s_b`}>
            어떤 문제를 어떻게 해결했는지 한 문장이라도 넣으면 좋아요.
          </span>
          <span className={`${styles.profile_form_count} font_body_s_b`}>
            {draft.bio.length} / {BIO_MAX}
          </span>
        </p>
      </>
    );
  }

  if (section === 'educations') {
    const byLevel = (a, b) => SCHOOL_LEVELS.indexOf(a.level) - SCHOOL_LEVELS.indexOf(b.level);

    // 최종학력을 바꾸면 빠진 구분을 채우고, 필요 없어진 빈 행은 지운다
    // 학교명을 적어둔 행은 실수로 날아가지 않게 남긴다
    const changeFinal = (final) => {
      const need = FINAL_EDUCATIONS[final] ?? [];
      const kept = draft.educations.filter((item) => need.includes(item.level) || item.title.trim());
      const missing = need
        .filter((level) => !kept.some((item) => item.level === level))
        .map((level) => ({ level, title: '', sub: '', meta: ' – ', badge: EDU_STATES[0] }));

      onChange({
        ...draft,
        educationLevel: final,
        educations: [...kept, ...missing].sort(byLevel),
      });
    };

    return (
      <>
        <div className={styles.profile_form_narrow}>
          <TextField
            label='최종학력'
            options={Object.keys(FINAL_EDUCATIONS)}
            value={draft.educationLevel}
            onChange={(event) => changeFinal(event.target.value)}
          />
        </div>

        <p className={`${styles.profile_form_hint} font_body_s_b`}>
          고등학교부터 순서대로 적어요. 블라인드 채용에 낼 거라면 고등학교는 빼도 괜찮아요.
        </p>

        {draft.educations.map((item, index) => {
          const [from, to] = splitMeta(item.meta);
          const isHighSchool = item.level === '고등학교';

          return (
            <div key={index} className={styles.profile_form_group}>
              <div className={styles.profile_form_row}>
                <div className={styles.profile_form_narrow}>
                  <TextField
                    label='구분'
                    options={SCHOOL_LEVELS}
                    value={item.level}
                    onChange={(event) =>
                      patch(
                        'educations',
                        draft.educations
                          .map((row, i) => (i === index ? { ...row, level: event.target.value } : row))
                          .sort(byLevel),
                      )
                    }
                  />
                </div>

                <TextField
                  label='학교명'
                  value={item.title}
                  onChange={(event) => patchList('educations', index, { ...item, title: event.target.value })}
                />

                {/* 고등학교는 전공이 없다 */}
                {!isHighSchool && (
                  <TextField
                    label='전공'
                    value={item.sub}
                    onChange={(event) => patchList('educations', index, { ...item, sub: event.target.value })}
                  />
                )}

                <div className={styles.profile_form_narrow}>
                  <TextField
                    label='상태'
                    options={EDU_STATES}
                    value={item.badge}
                    onChange={(event) => patchList('educations', index, { ...item, badge: event.target.value })}
                  />
                </div>

                <button
                  type='button'
                  className={styles.profile_form_del}
                  onClick={() => removeAt('educations', index)}
                  aria-label={`${item.title || item.level} 삭제`}
                >
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    delete
                  </span>
                </button>
              </div>

              <div className={styles.profile_form_row}>
                <TextField
                  label='입학'
                  value={from}
                  onChange={(event) =>
                    patchList('educations', index, { ...item, meta: joinMeta(event.target.value, to) })
                  }
                />
                <TextField
                  label='졸업'
                  value={to}
                  onChange={(event) =>
                    patchList('educations', index, { ...item, meta: joinMeta(from, event.target.value) })
                  }
                />
              </div>
            </div>
          );
        })}

        <RowActions
          addLabel='학력 추가'
          onAdd={() =>
            patch(
              'educations',
              [
                ...draft.educations,
                { level: '대학교', title: '', sub: '', meta: ' – ', badge: EDU_STATES[0] },
              ].sort(byLevel),
            )
          }
        />
      </>
    );
  }

  if (section === 'careers') {
    return (
      <>
        {draft.careers.map((item, index) => {
          const [from, to] = splitMeta(item.meta);

          return (
            <div key={index} className={styles.profile_form_group}>
              <div className={styles.profile_form_row}>
                <TextField
                  label='회사명'
                  value={item.title}
                  onChange={(event) => patchList('careers', index, { ...item, title: event.target.value })}
                />
                <TextField
                  label='직무'
                  value={item.sub}
                  onChange={(event) => patchList('careers', index, { ...item, sub: event.target.value })}
                />
                <div className={styles.profile_form_narrow}>
                  <TextField
                    label='상태'
                    options={CAREER_STATES}
                    value={item.badge}
                    onChange={(event) => patchList('careers', index, { ...item, badge: event.target.value })}
                  />
                </div>
                <button
                  type='button'
                  className={styles.profile_form_del}
                  onClick={() => removeAt('careers', index)}
                  aria-label={`${item.title} 삭제`}
                >
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    delete
                  </span>
                </button>
              </div>

              <div className={styles.profile_form_row}>
                <TextField
                  label='시작'
                  value={from}
                  onChange={(event) =>
                    patchList('careers', index, { ...item, meta: joinMeta(event.target.value, to) })
                  }
                />
                <TextField
                  label='종료'
                  value={to}
                  onChange={(event) =>
                    patchList('careers', index, { ...item, meta: joinMeta(from, event.target.value) })
                  }
                />
              </div>
            </div>
          );
        })}

        <RowActions
          addLabel='경력 추가'
          onAdd={() =>
            patch('careers', [
              ...draft.careers,
              { title: '', sub: '', meta: ' – ', badge: CAREER_STATES[0] },
            ])
          }
        />
      </>
    );
  }

  if (section === 'languages') {
    return (
      <>
        {draft.languages.map((item, index) => (
          <div key={index} className={styles.profile_form_group}>
            <div className={styles.profile_form_row}>
              <TextField
                label='언어'
                value={item.title}
                onChange={(event) => patchList('languages', index, { ...item, title: event.target.value })}
              />
              <TextField
                label='설명'
                value={item.sub}
                onChange={(event) => patchList('languages', index, { ...item, sub: event.target.value })}
              />
              <button
                type='button'
                className={styles.profile_form_del}
                onClick={() => removeAt('languages', index)}
                aria-label={`${item.title} 삭제`}
              >
                <span className='material-symbols-sharp' aria-hidden='true'>
                  delete
                </span>
              </button>
            </div>

            <ToggleGroup
              label={`${item.title} 수준`}
              options={LANGUAGE_LEVELS}
              value={item.badge}
              onChange={(level) => patchList('languages', index, { ...item, badge: level })}
            />
          </div>
        ))}

        <RowActions
          addLabel='언어 추가'
          onAdd={() =>
            patch('languages', [...draft.languages, { title: '', sub: '', badge: LANGUAGE_LEVELS[0] }])
          }
        />
      </>
    );
  }

  if (section === 'awards') {
    return (
      <>
        {draft.awards.map((item, index) => (
          <div key={index} className={styles.profile_form_row}>
            <TextField
              label='수상명'
              value={item.title}
              onChange={(event) => patchList('awards', index, { ...item, title: event.target.value })}
            />
            <div className={styles.profile_form_narrow}>
              <TextField
                label='수상일'
                value={item.date}
                onChange={(event) => patchList('awards', index, { ...item, date: event.target.value })}
              />
            </div>
            <button
              type='button'
              className={styles.profile_form_del}
              onClick={() => removeAt('awards', index)}
              aria-label={`${item.title} 삭제`}
            >
              <span className='material-symbols-sharp' aria-hidden='true'>
                delete
              </span>
            </button>
          </div>
        ))}

        <RowActions
          addLabel='수상 내역 추가'
          onAdd={() => patch('awards', [...draft.awards, { title: '', date: '' }])}
        />
      </>
    );
  }

  if (section === 'skills' || section === 'companies') {
    const isSkill = section === 'skills';

    return (
      <>
        <ul className={styles.profile_form_chips}>
          {draft[section].map((label, index) => (
            <LogoItem key={label} label={label} onRemove={() => removeAt(section, index)} />
          ))}
        </ul>

        <ChipAdder
          placeholder={isSkill ? '기술을 입력하고 Enter' : '회사를 입력하고 Enter'}
          onAdd={(value) => {
            if (draft[section].includes(value)) return;
            patch(section, [...draft[section], value]);
          }}
        />
      </>
    );
  }

  if (section === 'interests') {
    return (
      <ul className={styles.profile_form_interests}>
        {INTERESTS.map((label) => (
          <li key={label}>
            <InterestChip
              label={label}
              selected={draft.interests.includes(label)}
              onToggle={() =>
                patch(
                  'interests',
                  draft.interests.includes(label)
                    ? draft.interests.filter((item) => item !== label)
                    : [...draft.interests, label],
                )
              }
            />
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
