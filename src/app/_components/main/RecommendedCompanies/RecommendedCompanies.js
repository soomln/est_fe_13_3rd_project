'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecommendedCompanies } from '@backend/lib/api/companies';
import { PAGE_SIZE } from '@backend/lib/constants';
import styles from './RecommendedCompanies.module.sass';

export default function RecommendedCompanies() {
  const [companies, setCompanies] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    getRecommendedCompanies(PAGE_SIZE.homeCompanies)
      .then((items) => {
        if (cancelled) return;
        setCompanies(items);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') return null;

  return (
    <div className={styles.company_list_group}>
      <p className={`font_caption_b ${styles.company_list_label}`}>추천기업</p>
      {status === 'error' || companies.length === 0 ? (
        <p className={`font_body_s_r ${styles.company_list_empty}`}>추천 기업 정보를 불러오지 못했어요.</p>
      ) : (
        <ul className={styles.company_list}>
          {companies.map((company) => (
            <li key={company.id}>
              <Link href={`/search-companies/detail/${company.slug}`} className={styles.company_list_item}>
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={`${company.name} 로고`}
                    width={50}
                    height={38}
                    className={styles.company_list_logo}
                  />
                ) : (
                  <span className={`material-symbols-rounded ${styles.company_list_logo_fallback}`} aria-hidden='true'>
                    domain
                  </span>
                )}
                <div>
                  <p className={`font_body_m_b ${styles.company_list_name}`}>{company.name}</p>
                  <p className={`font_body_s_r ${styles.company_list_desc}`}>
                    {[company.category, company.location].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
