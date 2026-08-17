'use client';

import { useEffect, useMemo, useState } from 'react';

import { PAGE_SIZE } from '@backend/lib/constants';
import { getCodeGroups } from '@backend/lib/api/codes';
import { listCompanies, toggleCompanyBookmark } from '@backend/lib/api/companies';
import { useAuth } from '@/app/_components/auth';
import CompanyCard from '@/app/_components/common/CompanyCard';
import Pagination from '@/app/_components/common/Pagination';
import FilterSidebar from '@/app/search-companies/_components/FilterSidebar';
import SearchHero from '@/app/search-companies/_components/SearchHero';
import { FILTER_GROUPS } from '@/app/search-companies/_lib/options';
import styles from './SearchCompaniesClient.module.sass';

const RECOMMENDED_KEYWORDS = ['네이버', '토스', '카카오'];
const EMPTY_FILTERS = { jobRole: '', size: '', industry: '' };

export default function SearchCompaniesClient() {
  const { isLoggedIn, openLogin } = useAuth();

  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const [codes, setCodes] = useState({});
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;

    async function fetchCodes() {
      try {
        const result = await getCodeGroups(FILTER_GROUPS.map((group) => group.group));

        if (!ignore) setCodes(result);
      } catch (error) {
        console.error(error);
      }
    }

    fetchCodes();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchCompanies() {
      setStatus('loading');

      try {
        const result = await listCompanies({ q: query, ...filters, page });

        if (ignore) return;

        setCompanies(result.items);
        setTotal(result.total);
        setStatus('ready');
      } catch (error) {
        console.error(error);

        if (!ignore) setStatus('error');
      }
    }

    fetchCompanies();

    return () => {
      ignore = true;
    };
  }, [query, filters, page]);

  // '전체' 를 맨 앞에 붙인 필터 선택지
  const filterGroups = useMemo(
    () =>
      FILTER_GROUPS.map((group) => ({
        key: group.key,
        title: group.title,
        options: [{ code: '', label: '전체' }, ...(codes[group.group] ?? [])],
      })),
    [codes]
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE.companies));

  const handleSubmit = (event) => {
    event.preventDefault();

    setQuery(keyword.trim());
    setPage(1);
  };

  const handleRecommendedClick = (item) => {
    setKeyword(item);
    setQuery(item);
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleFilterChange = (key, code) => {
    setFilters((prev) => ({ ...prev, [key]: code }));
    setPage(1);
  };

  const handleReset = () => {
    setKeyword('');
    setQuery('');
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const handleBookmarkClick = async (company) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    setCompanies((prev) =>
      prev.map((item) => (item.id === company.id ? { ...item, bookmarkedByMe: !item.bookmarkedByMe } : item))
    );

    try {
      await toggleCompanyBookmark(company.id);
    } catch (error) {
      console.error(error);

      setCompanies((prev) =>
        prev.map((item) => (item.id === company.id ? { ...item, bookmarkedByMe: company.bookmarkedByMe } : item))
      );
    }
  };

  return (
    <main className={styles.page}>
      <div className={`container ${styles.page_inner}`}>
        <SearchHero
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSubmit={handleSubmit}
          recommendedKeywords={RECOMMENDED_KEYWORDS}
          onRecommendedClick={handleRecommendedClick}
        />

        <div className={styles.content}>
          <FilterSidebar
            groups={filterGroups}
            values={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
          />

          <section className={styles.list}>
            <p className={`${styles.list_count} font_body_l_b`}>
              전체 <span className={styles.list_count_point}>{total}</span>개 기업
            </p>

            {status === 'error' && <p className={styles.list_state}>기업 목록을 불러오지 못했습니다.</p>}

            {status !== 'error' && companies.length === 0 && (
              <p className={styles.list_state}>{status === 'loading' ? '불러오는 중...' : '조건에 맞는 기업이 없습니다.'}</p>
            )}

            {companies.length > 0 && (
              <div className={styles.list_grid}>
                {companies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    href={`/search-companies/detail/${company.slug}`}
                    showBookmark
                    isBookmarked={company.bookmarkedByMe ?? false}
                    onBookmarkClick={() => handleBookmarkClick(company)}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className={styles.list_pagination}>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
