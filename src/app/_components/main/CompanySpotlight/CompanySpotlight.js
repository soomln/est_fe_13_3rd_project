'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getRecommendedCompanies, getCompany } from '@backend/lib/api/companies';
import { PAGE_SIZE } from '@backend/lib/constants';
import styles from './CompanySpotlight.module.sass';

const SCORE_META = [
  { key: 'salary', label: '급여 · 보상', color: 'green' },
  { key: 'wlb', label: '워라벨', color: 'amber' },
  { key: 'culture', label: '사내 문화', color: 'purple' },
  { key: 'growth', label: '성장 가능성', color: 'gray' },
];

// 백엔드 로고 SVG 중 estsoft.svg는 viewBox 여백 문제로 실제 그림이 작게 나와서 로컬 이미지로 대체
const LOGO_OVERRIDES = {
  estsoft: '/images/estSoft-1.png',
};

// 아직 후기가 없어 ratings가 전부 0인 기업은, 실제 후기가 쌓이기 전까지 보여줄
// 임시 점수를 slug 기반으로 결정적으로 생성한다 (매번 같은 기업은 같은 값, 기업마다 다른 값).
function pseudoScore(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 1000;
  return Math.round((3.6 + (hash / 1000) * 1.2) * 10) / 10;
}

function toSpotlightData(company) {
  const hasRealRatings = SCORE_META.some(({ key }) => (company.ratings[key] ?? 0) > 0);

  return {
    slug: company.slug,
    companyName: company.name,
    logoSrc: LOGO_OVERRIDES[company.slug] ?? company.logo,
    salary: [
      { label: '전체 평균', value: company.salary.overall.toLocaleString(), labelColor: 'black' },
      { label: '신입 평균', value: company.salary.entry.toLocaleString(), labelColor: 'green' },
      { label: '상위 25%', value: company.salary.top25.toLocaleString(), labelColor: 'amber' },
    ],
    scores: SCORE_META.map(({ key, label, color }) => ({
      label,
      color,
      value: hasRealRatings ? company.ratings[key] ?? 0 : pseudoScore(company.slug + key),
    })),
    benefits: company.benefits.slice(0, 4),
  };
}

const DEFAULT_SPOTLIGHT = {
  slug: 'estsoft',
  companyName: '이스트소프트',
  logoSrc: '/images/estSoft-1.png',
  salary: [
    { label: '전체 평균', value: '5,240', labelColor: 'black' },
    { label: '신입 평균', value: '3,800', labelColor: 'green' },
    { label: '상위 25%', value: '7,100', labelColor: 'amber' },
  ],
  scores: [
    { label: '급여 · 보상', value: 4.5, color: 'green' },
    { label: '워라벨', value: 4.5, color: 'amber' },
    { label: '사내 문화', value: 4.5, color: 'purple' },
    { label: '성장 가능성', value: 4.5, color: 'gray' },
  ],
  benefits: [
    { icon: 'home', title: '생활 및 주거 지원', description: '기숙사·주거비\n식비 지원' },
    { icon: 'syringe', title: '건강 및 의료 지원', description: '건강검진·의료비보험 지원' },
    { icon: 'family_group', title: '가족 친화 제도', description: '육아휴직·출산\n경조사 지원' },
    { icon: 'travel', title: '근무 방식 및 휴가', description: '반반차·재택·휴가' },
  ],
};

const ANIMATION_DURATION = 900;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function ScoreDonut({ label, value, color, animate, delay, replayKey }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animate) return undefined;

    setDisplayValue(0);
    let raf;
    let startTime = null;

    const tick = (now) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime - delay;

      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
      setDisplayValue(value * easeOutCubic(progress));

      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, value, delay, replayKey]);

  const percent = (displayValue / 5) * 100;

  return (
    <div className={styles.score_item}>
      <p className={`font_body_l_b ${styles.score_label} ${styles[`color_${color}`]}`}>{label}</p>

      <div className={styles.donut} style={{ '--percent': `${percent}%`, '--color': `var(--donut-${color})` }}>
        <div className={styles.donut_inner}>
          <span className={`font_h2 ${styles.donut_value}`}>{displayValue.toFixed(1)}</span>
          <span className={`font_body_l_r ${styles.donut_unit}`}>점</span>
        </div>
      </div>
    </div>
  );
}

export default function CompanySpotlight() {
  const rowRef = useRef(null);
  const [animate, setAnimate] = useState(false);
  const [companies, setCompanies] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getRecommendedCompanies(PAGE_SIZE.homeCompanies ?? 5)
      .then(async (cards) => {
        const details = await Promise.all(cards.map((c) => getCompany(c.slug).catch(() => null)));
        if (cancelled) return;
        setCompanies(details.filter(Boolean).map(toSpotlightData));
      })
      .catch(() => {
        if (!cancelled) setCompanies([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [companies]);

  if (companies === null) return null;

  const list = companies.length > 0 ? companies : [DEFAULT_SPOTLIGHT];
  const current = list[index % list.length];
  const { companyName, logoSrc, salary, scores, benefits } = current;

  const goPrev = () => setIndex((i) => (i - 1 + list.length) % list.length);
  const goNext = () => setIndex((i) => (i + 1) % list.length);

  return (
    <div className={styles.spotlight}>
      <div className={styles.brand}>
        <Image src={logoSrc} alt={`${companyName} 로고`} width={104} height={47} />
        <p className={`font_h3 ${styles.brand_name}`}>{companyName}</p>

        {list.length > 1 && (
          <div className={styles.spotlight_nav}>
            <button type='button' className={styles.spotlight_nav_btn} aria-label='이전 기업' onClick={goPrev}>
              <span className='material-symbols-rounded' aria-hidden='true'>
                chevron_left
              </span>
            </button>
            <button type='button' className={styles.spotlight_nav_btn} aria-label='다음 기업' onClick={goNext}>
              <span className='material-symbols-rounded' aria-hidden='true'>
                chevron_right
              </span>
            </button>
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.salary_block}>
          <p className={`font_body_m_b ${styles.salary_title}`}>평균 연봉</p>

          <div className={styles.salary_row}>
            {salary.map((item) => (
              <div key={item.label} className={styles.salary_item}>
                <p className={`font_body_m_b ${styles.salary_label} ${styles[`color_${item.labelColor}`]}`}>
                  {item.label}
                </p>
                <div className={styles.salary_value_group}>
                  <span className={`font_body_l_b ${styles.salary_value}`}>{item.value}</span>
                  <span className={`font_body_m_r ${styles.salary_unit}`}>만원</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.score_row} ref={rowRef}>
          {scores.map((item, i) => (
            <ScoreDonut
              key={item.label}
              label={item.label}
              value={item.value}
              color={item.color}
              animate={animate}
              delay={i * 120}
              replayKey={index}
            />
          ))}
        </div>
      </div>

      <div className={styles.benefit_row}>
        {benefits.map((item) => (
          <div key={item.title} className={styles.benefit_item}>
            <span className={`material-symbols-sharp ${styles.benefit_icon}`} aria-hidden='true'>
              {item.icon}
            </span>
            <p className={`font_body_m_b ${styles.benefit_title}`}>{item.title}</p>
            <p className={`font_body_s_r ${styles.benefit_desc}`}>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
