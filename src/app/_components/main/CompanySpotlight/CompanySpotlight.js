'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './CompanySpotlight.module.sass';

const DEFAULT_SALARY = [
  { label: '전체 평균', value: '5,240', labelColor: 'black' },
  { label: '신입 평균', value: '3,800', labelColor: 'green' },
  { label: '상위 25%', value: '7,100', labelColor: 'amber' },
];

const DEFAULT_SCORES = [
  { label: '급여 · 보상', value: 4.5, color: 'green' },
  { label: '워라벨', value: 4.5, color: 'amber' },
  { label: '사내 문화', value: 4.5, color: 'purple' },
  { label: '성장 가능성', value: 4.5, color: 'gray' },
];

const DEFAULT_BENEFITS = [
  { icon: 'home', title: '생활 및 주거 지원', description: '기숙사·주거비\n식비 지원' },
  { icon: 'syringe', title: '건강 및 의료 지원', description: '건강검진·의료비보험 지원' },
  { icon: 'family_group', title: '가족 친화 제도', description: '육아휴직·출산\n경조사 지원' },
  { icon: 'travel', title: '근무 방식 및 휴가', description: '반반차·재택·휴가' },
];

const ANIMATION_DURATION = 900;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function ScoreDonut({ label, value, color, animate, delay }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!animate) return undefined;

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
  }, [animate, value, delay]);

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

export default function CompanySpotlight({
  companyName = '이스트소프트',
  logoSrc = '/images/estSoft-1.png',
  salary = DEFAULT_SALARY,
  scores = DEFAULT_SCORES,
  benefits = DEFAULT_BENEFITS,
}) {
  const rowRef = useRef(null);
  const [animate, setAnimate] = useState(false);

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
  }, []);

  return (
    <div className={styles.spotlight}>
      <div className={styles.brand}>
        <Image src={logoSrc} alt={`${companyName} 로고`} width={104} height={47} />
        <p className={`font_h3 ${styles.brand_name}`}>{companyName}</p>
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
            <ScoreDonut key={item.label} label={item.label} value={item.value} color={item.color} animate={animate} delay={i * 120} />
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
