'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Pagination from '@/app/_components/common/Pagination';
import PortfolioCard from '@/app/_components/common/PortfolioCard';
import FilterChip from '@/app/mypage/_components/FilterChip';
import SearchPill from '@/app/mypage/_components/SearchPill';
import SortPill from '@/app/mypage/_components/SortPill';
import styles from './PortfolioBrowser.module.sass';

const PAGE_SIZE = 6;

const SCOPES = [
  { value: '', label: '내 포트폴리오' },
  { value: 'scrapped', label: '스크랩한 포트폴리오' },
];

const SORTS = { 등록순: 'created', 최신순: 'latest', 인기순: 'popular' };

const SORTERS = {
  created: (a, b) => a.order - b.order,
  latest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  popular: (a, b) => b.likeCount - a.likeCount,
};

// 쿼리에서 생략하는 기본값
const DEFAULTS = { scope: '', q: '', sort: 'created', page: '1' };

export default function PortfolioBrowser({ portfolios }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const scope = searchParams.get('scope') ?? '';
  const keyword = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort') ?? '';
  const sort = SORTERS[sortParam] ? sortParam : 'created';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sortLabel = Object.keys(SORTS).find((label) => SORTS[label] === sort);

  const updateQuery = (changes) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(changes).forEach(([key, value]) => {
      const text = String(value ?? '');
      if (text === '' || text === DEFAULTS[key]) next.delete(key);
      else next.set(key, text);
    });

    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return portfolios
      .map((item, index) => ({ ...item, order: index }))
      .filter((item) => (scope === 'scrapped' ? item.isScrapped : !item.isScrapped))
      .filter((item) => (text ? item.title.toLowerCase().includes(text) : true))
      .sort(SORTERS[sort]);
  }, [portfolios, scope, keyword, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className={styles.portfolio_browser_head}>
        <div className={styles.portfolio_browser_head_text}>
          <h1 className={`${styles.portfolio_browser_head_title} font_h1`}>포트폴리오</h1>
          <p className={`${styles.portfolio_browser_head_desc} font_body_m_r`}>
            내가 올린 작업물과 갤러리에서 스크랩한 포트폴리오예요.
          </p>
        </div>

        <div className={styles.portfolio_browser_head_btns}>
          <Link
            href='/mypage/portfolio?mode=delete'
            className={`${styles.portfolio_browser_ghost_btn} font_body_l_b`}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              delete
            </span>
            삭제
          </Link>

          <Link href='/portfolio' className={`${styles.portfolio_browser_new_btn} font_body_l_b`}>
            <span className='material-symbols-sharp' aria-hidden='true'>
              add
            </span>
            등록하기
          </Link>
        </div>
      </div>

      <div className={styles.portfolio_browser}>
        <div className={styles.portfolio_browser_filter}>
          <div className={styles.portfolio_browser_chips}>
            {SCOPES.map((item) => (
              <FilterChip
                key={item.value || 'mine'}
                label={item.label}
                isActive={scope === item.value}
                onClick={() => updateQuery({ scope: item.value, page: 1 })}
              />
            ))}
          </div>

          <div className={styles.portfolio_browser_tools}>
            <SearchPill
              key={keyword}
              placeholder='포트폴리오 이름으로 검색'
              onSearch={(text) => updateQuery({ q: text, page: 1 })}
            />
            <SortPill
              options={Object.keys(SORTS)}
              value={sortLabel}
              onChange={(label) => updateQuery({ sort: SORTS[label], page: 1 })}
            />
          </div>
        </div>

        {items.length > 0 ? (
          <ul className={styles.portfolio_browser_grid}>
            {items.map((item) => (
              <PortfolioCard
                key={item.id}
                item={item}
                onClick={() => router.push(`/portfolio/${item.id}`)}
              />
            ))}
          </ul>
        ) : (
          <div className={styles.portfolio_browser_empty}>
            <span
              className={`material-symbols-sharp ${styles.portfolio_browser_empty_icon}`}
              aria-hidden='true'
            >
              folder_open
            </span>
            <p className={`${styles.portfolio_browser_empty_title} font_h4`}>
              {scope === 'scrapped' ? '스크랩한 포트폴리오가 없습니다' : '등록한 포트폴리오가 없습니다'}
            </p>
            <p className={`${styles.portfolio_browser_empty_desc} font_body_m_r`}>
              {scope === 'scrapped'
                ? '갤러리에서 마음에 드는 작업물을 스크랩해보세요.'
                : '등록하기를 눌러 작업물을 올려보세요.'}
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.portfolio_browser_pagination}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(next) => updateQuery({ page: next })}
            />
          </div>
        )}
      </div>
    </>
  );
}
