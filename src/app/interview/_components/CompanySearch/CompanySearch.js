'use client';

import { useEffect, useState } from 'react';
import styles from './CompanySearch.module.sass';
import { listCompanies } from '@backend/lib/api/companies';

// 한 자 칠 때마다 찾으면 서버를 너무 자주 부른다. 잠깐 멈췄을 때 한 번만 보낸다
const SEARCH_DELAY = 250;

export default function CompanySearch({
  selectedId,
  onSelect,
}) {
  const [companies, setCompanies] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [again, setAgain] = useState(0);

  // 한 자 칠 때마다 찾는다. 다 지우면 빈 검색어가 되어 처음 목록으로 돌아간다
  useEffect(() => {
    let ignore = false;
    const trimmedKeyword = keyword.trim();

    const timer = setTimeout(async () => {
      try {
        const { items } = await listCompanies({
          q: trimmedKeyword || undefined,
          page: 1,
          pageSize: 20,
        });
        if (ignore) return;
        setCompanies(items);
        setSearchKeyword(trimmedKeyword);
      } catch (error) {
        console.error('기업 검색 실패:', error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }, SEARCH_DELAY);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [keyword, again]);

  return (
    <section className={styles.company_search}>
      <h3 className="font_body_l_b">기업 검색</h3>
      <div className={styles.company_search_input}>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setAgain((n) => n + 1);
            }
          }}
          placeholder="기업명을 입력하세요."
          className="font_body_s_r"
          aria-label="기업명 검색"
        />
        <button
          type="button"
          className={styles.company_search_button}
          aria-label="기업 검색"
          onClick={() => setAgain((n) => n + 1)}
        >
          <span className="material-symbols-outlined">
            search
          </span>
        </button>
      </div>
      <ul className={styles.company_list}>
        {isLoading ? (
          <li className={`${styles.company_list_item} font_body_l_r`}>
            불러오는 중...
          </li>
        ) : companies.length === 0 ? (
          <li className={`${styles.company_list_item} font_body_l_r`}>
            {searchKeyword
              ? '검색 결과가 없습니다.'
              : '등록된 기업이 없습니다.'}
          </li>
        ) : (
          companies.map((company) => {
            const isSelected = selectedId === company.id;

            return (
              <li
                key={company.id}
                className={`${styles.company_list_item} font_body_l_r ${
                  isSelected ? 'is_selected' : ''
                }`}
                onClick={() => onSelect(company.id, company)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(company.id, company);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
              >
                <span className={`material-symbols-outlined ${styles.company_checkbox}`}>
                  {isSelected
                    ? 'check_box'
                    : 'check_box_outline_blank'}
                </span>
                <span>{company.name}</span>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}