'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecommendedCompanies } from '@backend/lib/api/companies';
import styles from './RecommendedCompanies.module.sass';

export default function RecommendedCompanies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    let cancelled = false;

    getRecommendedCompanies(3)
      .then((items) => {
        if (!cancelled) setCompanies(items);
      })
      .catch(() => {
        if (!cancelled) setCompanies([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (companies.length === 0) return null;

  return (
    <div className={styles.company_list_group}>
      <p className={`font_caption_b ${styles.company_list_label}`}>추천기업</p>
      <ul className={styles.company_list}>
        {companies.map((company) => (
          <li key={company.id}>
            <Link href={`/search-companies/detail/${company.slug}`} className={styles.company_list_item}>
              {company.logo ? (
                <img src={company.logo} alt={`${company.name} 로고`} className={styles.company_list_logo} />
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
    </div>
  );
}
