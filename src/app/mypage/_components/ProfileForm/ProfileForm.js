'use client';

import TextField from '@/app/mypage/_components/TextField';
import ToggleGroup from '@/app/mypage/_components/ToggleGroup';
import InterestChip from '@/app/mypage/_components/InterestChip';
import SearchSelect from '@/app/mypage/_components/SearchSelect';
import LogoItem from '@/app/mypage/_components/LogoItem';
import { useMyProfile } from '@/app/mypage/_components/MyProfileProvider';
import LANGUAGES from '@/app/mypage/_lib/languages';
import techIcon from '@/app/mypage/_lib/techIcon';
import { isOngoing, dateHint, monthValue, FINAL_EDUCATIONS } from '@/app/mypage/_lib/profileMap';
import styles from './ProfileForm.module.sass';





const CAREER_STATES = ['재직 중', '퇴사'];

const BIO_MAX = 1000;

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


// 섹션마다 다른 편집 폼. draft 를 직접 고치지 않고 onChange 로 통째로 넘긴다
export default function ProfileForm({ section, draft, onChange, errorFields = {} }) {
  const { codes } = useMyProfile();

  // 선택지는 전부 서버 코드표에서 온다
  const labelsOf = (group) => (codes[group] ?? []).map((item) => item.label);
  const EDU_STATES = labelsOf('edu_status');
  const SCHOOL_LEVELS = labelsOf('school_type');
  const FINAL_LEVELS = labelsOf('education_level');
  const LANGUAGE_LEVELS = labelsOf('language_level');

  // 진행 중이면 종료칸에 상태 글자를 넣고, 끝난 상태로 바꾸면 비운다
  const changeBadge = (key, index, item, badge) => {
    const [from] = splitMeta(item.meta);
    const to = isOngoing(badge) ? badge : '';
    patchList(key, index, { ...item, badge, meta: joinMeta(from, to) });
  };

  // 저장 때 잡혔고 아직 그대로인 칸만 테두리가 빨개진다. 고치면 바로 풀린다
  const isBad = (index, key, stillWrong) => Boolean(errorFields[index]?.[key]) && stillWrong;

  const isEmpty = (text) => !String(text ?? '').trim();
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
        .map((level) => ({ level, title: '', sub: '', meta: ' – ', badge: '졸업' }));

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
            options={FINAL_LEVELS}
            value={draft.educationLevel}
            onChange={(event) => changeFinal(event.target.value)}
          />
        </div>

        <p className={`${styles.profile_form_hint} font_body_s_b`}>
          고등학교부터 순서대로 적어요. 블라인드 채용에 낼 거라면 고등학교는 빼도 괜찮아요.
        </p>

        {draft.educations.map((item, index) => {
          const [from, to] = splitMeta(item.meta);
          const fromHint = dateHint(from);
          const toHint = dateHint(to, { after: monthValue(from), afterLabel: '입학' });
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
                  placeholder='서울대학교'
                  hasError={isBad(index, 'title', isEmpty(item.title))}
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
                    onChange={(event) => changeBadge('educations', index, item, event.target.value)}
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
                  placeholder='2020.03'
                  hasError={isBad(index, 'from', Boolean(fromHint) || isEmpty(from))}
                  errorText={fromHint}
                  value={from}
                  onChange={(event) =>
                    patchList('educations', index, { ...item, meta: joinMeta(event.target.value, to) })
                  }
                />
                <TextField
                  label='졸업'
                  placeholder='2024.02'
                  disabled={isOngoing(item.badge)}
                  hasError={isBad(index, 'to', !isOngoing(item.badge) && (Boolean(toHint) || isEmpty(to)))}
                  errorText={isOngoing(item.badge) ? undefined : toHint}
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
                { level: '대학교', title: '', sub: '', meta: ' – ', badge: '졸업' },
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
          const fromHint = dateHint(from);
          const toHint = dateHint(to, { after: monthValue(from), afterLabel: '시작' });

          return (
            <div key={index} className={styles.profile_form_group}>
              <div className={styles.profile_form_row}>
                <TextField
                  label='회사명'
                  hasError={isBad(index, 'title', isEmpty(item.title))}
                  value={item.title}
                  onChange={(event) => patchList('careers', index, { ...item, title: event.target.value })}
                />
                <TextField
                  label='직무'
                  hasError={isBad(index, 'sub', isEmpty(item.sub))}
                  value={item.sub}
                  onChange={(event) => patchList('careers', index, { ...item, sub: event.target.value })}
                />
                <div className={styles.profile_form_narrow}>
                  <TextField
                    label='상태'
                    options={CAREER_STATES}
                    value={item.badge}
                    onChange={(event) => changeBadge('careers', index, item, event.target.value)}
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
                  placeholder='2024.03'
                  hasError={isBad(index, 'from', Boolean(fromHint) || isEmpty(from))}
                  errorText={fromHint}
                  value={from}
                  onChange={(event) =>
                    patchList('careers', index, { ...item, meta: joinMeta(event.target.value, to) })
                  }
                />
                <TextField
                  label='종료'
                  placeholder='2026.02'
                  disabled={isOngoing(item.badge)}
                  hasError={isBad(index, 'to', !isOngoing(item.badge) && (Boolean(toHint) || isEmpty(to)))}
                  errorText={isOngoing(item.badge) ? undefined : toHint}
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
              { title: '', sub: '', meta: joinMeta('', CAREER_STATES[0]), badge: CAREER_STATES[0] },
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
              <SearchSelect
                label='언어'
                hasError={isBad(index, 'title', isEmpty(item.title))}
                placeholder='언어를 검색하세요'
                options={LANGUAGES.map((name) => ({ label: name }))}
                value={item.title}
                onSelect={(option) => patchList('languages', index, { ...item, title: option.label })}
              />
              <TextField
                label='설명 (예: TOEIC 800점, 일상 회화 가능 등)'
                placeholder='TOEIC 800점'
                hasError={isBad(index, 'sub', isEmpty(item.sub))}
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
              hasError={isBad(index, 'title', isEmpty(item.title))}
              value={item.title}
              onChange={(event) => patchList('awards', index, { ...item, title: event.target.value })}
            />
            <div className={styles.profile_form_narrow}>
              <TextField
                label='수상일'
                placeholder='2026.01'
                hasError={isBad(index, 'date', Boolean(dateHint(item.date)) || isEmpty(item.date))}
                errorText={dateHint(item.date)}
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

  // 검색해서 추가하고, 로고 오른쪽 위 - 로 뺀다
  if (section === 'skills') {
    const group = codes.tech_stack ?? [];
    const codeOf = (label) => group.find((item) => item.label === label)?.code;

    return (
      <>
        <ul className={styles.profile_form_chips}>
          {draft.skills.map((label, index) => (
            <LogoItem
              key={label}
              label={label}
              icon={techIcon(codeOf(label))}
              onRemove={() => removeAt('skills', index)}
            />
          ))}
        </ul>

        <SearchSelect
          placeholder='기술을 검색해서 추가하세요'
          options={group
            .filter((item) => !draft.skills.includes(item.label))
            .map((item) => ({ value: item.code, label: item.label }))}
          clearOnSelect
          onSelect={(option) => patch('skills', [...draft.skills, option.label])}
        />
      </>
    );
  }

  if (section === 'interests') {
    const toggle = (label) =>
      patch(
        'interests',
        draft.interests.includes(label)
          ? draft.interests.filter((item) => item !== label)
          : [...draft.interests, label],
      );

    return (
      <ul className={styles.profile_form_interests}>
        {(codes.interest_field ?? []).map((item) => (
          <li key={item.code}>
            <InterestChip
              label={item.label}
              selected={draft.interests.includes(item.label)}
              onToggle={() => toggle(item.label)}
            />
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
