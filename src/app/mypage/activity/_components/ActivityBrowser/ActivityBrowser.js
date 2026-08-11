'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Pagination from '@/app/_components/common/Pagination';
import CompanyCard from '@/app/mypage/_components/CompanyCard';
import FilterChip from '@/app/mypage/_components/FilterChip';
import QbankCard from '@/app/mypage/_components/QbankCard';
import SearchPill from '@/app/mypage/_components/SearchPill';
import SortPill from '@/app/mypage/_components/SortPill';
import styles from './ActivityBrowser.module.sass';

// 카드 높이가 달라서 탭마다 개수를 다르게 둔다
const PAGE_SIZE = { company: 9, qbank: 5 };

const TABS = [
  { value: '', label: '스크랩한 기업' },
  { value: 'qbank', label: '면접 질문 족보' },
];

const SORTS = { 최신순: 'latest', 오래된순: 'oldest', 이름순: 'name' };

// 쿼리에서 생략하는 기본값
const DEFAULTS = { tab: '', q: '', sort: 'latest', page: '1' };

export default function ActivityBrowser({ companies, qbanks }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState([]);

  const isDeleteMode = searchParams.get('mode') === 'delete';
  const isQbank = searchParams.get('tab') === 'qbank';
  const keyword = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort') ?? '';
  const sort = Object.values(SORTS).includes(sortParam) ? sortParam : 'latest';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sortLabel = Object.keys(SORTS).find((label) => SORTS[label] === sort);
  const pageSize = isQbank ? PAGE_SIZE.qbank : PAGE_SIZE.company;

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

    // 기업은 이름, 족보는 회사명과 질문 전체를 훑는다
    const source = isQbank ? qbanks : companies;
    const matches = (item) =>
      isQbank
        ? [item.companyName, ...item.questions].some((field) => field.toLowerCase().includes(text))
        : item.name.toLowerCase().includes(text);
    const nameOf = (item) => (isQbank ? item.companyName : item.name);

    const sorters = {
      latest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
      name: (a, b) => nameOf(a).localeCompare(nameOf(b), 'ko'),
    };

    return source.filter((item) => (text ? matches(item) : true)).sort(sorters[sort]);
  }, [companies, qbanks, isQbank, keyword, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((one) => one !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? [] : items.map((item) => item.id));
  };

  // 탭마다 지우는 대상이 달라서 탭을 옮기면 선택을 비운다
  const changeTab = (value) => {
    setSelectedIds([]);
    updateQuery({ tab: value, q: '', page: 1 });
  };

  return (
    <>
      <div className={styles.activity_browser_head}>
        <div className={styles.activity_browser_head_text}>
          <h1 className={`${styles.activity_browser_head_title} font_h1`}>내 활동</h1>
          <p className={`${styles.activity_browser_head_desc} font_body_m_r`}>
            스크랩한 기업과 면접 질문 족보를 모아뒀어요.
          </p>
        </div>

        <div className={styles.activity_browser_head_btns}>
          {isDeleteMode ? (
            <>
              <Link
                href={isQbank ? '/mypage/activity?tab=qbank' : '/mypage/activity'}
                className={`${styles.activity_browser_ghost_btn} font_body_l_b`}
                onClick={() => setSelectedIds([])}
              >
                취소
              </Link>

              <button
                type='button'
                className={`${styles.activity_browser_ghost_btn} font_body_l_b`}
                onClick={toggleAll}
              >
                {isAllSelected ? '선택 해제' : '전체 선택'}
              </button>

              <button
                type='button'
                className={`${styles.activity_browser_delete_btn} font_body_l_b`}
                disabled={selectedIds.length === 0}
              >
                선택 삭제{selectedIds.length > 0 && ` ${selectedIds.length}`}
              </button>
            </>
          ) : (
            <Link
              href={
                isQbank ? '/mypage/activity?tab=qbank&mode=delete' : '/mypage/activity?mode=delete'
              }
              className={`${styles.activity_browser_ghost_btn} font_body_l_b`}
            >
              <span className='material-symbols-sharp' aria-hidden='true'>
                delete
              </span>
              삭제
            </Link>
          )}
        </div>
      </div>

      {isDeleteMode && (
        <p className={`${styles.activity_browser_notice} font_body_m_b`} role='status'>
          <span className='material-symbols-sharp' aria-hidden='true'>
            info
          </span>
          삭제 모드입니다. 삭제할 항목을 체크한 뒤 우측 상단 “선택 삭제”를 눌러주세요.
        </p>
      )}

      <div className={styles.activity_browser}>
        <div className={styles.activity_browser_filter}>
          <div className={styles.activity_browser_chips}>
            {TABS.map((tab) => (
              <FilterChip
                key={tab.value || 'company'}
                label={tab.label}
                isActive={(tab.value === 'qbank') === isQbank}
                onClick={() => changeTab(tab.value)}
              />
            ))}

            {isDeleteMode && (
              <span className={`${styles.activity_browser_guide} font_body_m_b`}>
                삭제할 항목을 선택해주세요
              </span>
            )}
          </div>

          <div className={styles.activity_browser_tools}>
            <SearchPill
              key={`${isQbank}-${keyword}`}
              placeholder={isQbank ? '질문 내용으로 검색' : '기업 이름으로 검색'}
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
          <div className={isQbank ? styles.activity_browser_list : styles.activity_browser_grid}>
            {items.map((item) => {
              const card = isQbank ? (
                <QbankCard
                  qbank={item}
                  isSelected={selectedIds.includes(item.id)}
                  onToggle={isDeleteMode ? () => toggleOne(item.id) : undefined}
                />
              ) : (
                <CompanyCard
                  company={item}
                  isSelected={selectedIds.includes(item.id)}
                  onToggle={isDeleteMode ? () => toggleOne(item.id) : undefined}
                />
              );

              // 삭제모드에서는 상세로 가지 않고 선택만 한다
              if (isDeleteMode) {
                return (
                  <div
                    key={item.id}
                    className={styles.activity_browser_link}
                    onClick={() => toggleOne(item.id)}
                  >
                    {card}
                  </div>
                );
              }

              // 주의: 기업 상세가 고정 경로라 slug 를 못 넘긴다. 동적 라우트가 생기면 교체
              return (
                <Link
                  key={item.id}
                  href={
                    isQbank
                      ? `/search-companies/interview-question/${item.id}`
                      : '/search-companies/detail'
                  }
                  className={styles.activity_browser_link}
                >
                  {card}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className={styles.activity_browser_empty}>
            <span
              className={`material-symbols-sharp ${styles.activity_browser_empty_icon}`}
              aria-hidden='true'
            >
              {isQbank ? 'quiz' : 'apartment'}
            </span>
            <p className={`${styles.activity_browser_empty_title} font_h4`}>
              {keyword
                ? '검색 결과가 없습니다'
                : isQbank
                  ? '스크랩한 족보가 없습니다'
                  : '스크랩한 기업이 없습니다'}
            </p>
            <p className={`${styles.activity_browser_empty_desc} font_body_m_r`}>
              {keyword
                ? '다른 키워드로 찾아보세요.'
                : isQbank
                  ? '기업 탐색에서 마음에 드는 족보를 스크랩해보세요.'
                  : '기업 탐색에서 관심 있는 기업을 스크랩해보세요.'}
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.activity_browser_pagination}>
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
