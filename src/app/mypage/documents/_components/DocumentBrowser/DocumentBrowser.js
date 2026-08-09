'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Pagination from '@/app/_components/common/Pagination';
import FilterChip from '@/app/mypage/_components/FilterChip';
import SearchPill from '@/app/mypage/_components/SearchPill';
import SortPill from '@/app/mypage/_components/SortPill';
import DocumentRow from '@/app/mypage/_components/DocumentRow';
import styles from './DocumentBrowser.module.sass';

const PAGE_SIZE = 10;

const DOC_TYPES = [
  { value: '', label: '전체' },
  { value: 'resume', label: '이력서' },
  { value: 'cover_letter', label: '자기소개서' },
];

const SORTS = { 등록순: 'created', 최신순: 'latest', 이름순: 'title' };

const SORTERS = {
  created: (a, b) => a.order - b.order,
  latest: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  title: (a, b) => a.title.localeCompare(b.title, 'ko'),
};

// 쿼리에서 생략하는 기본값
const DEFAULTS = { docType: '', q: '', sort: 'created', page: '1' };

export default function DocumentBrowser({ documents }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState([]);

  const isDeleteMode = searchParams.get('mode') === 'delete';
  const docType = searchParams.get('docType') ?? '';
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

    return documents
      .map((item, index) => ({ ...item, order: index }))
      .filter((item) => (docType ? item.docType === docType : true))
      .filter((item) => (text ? item.title.toLowerCase().includes(text) : true))
      .sort(SORTERS[sort]);
  }, [documents, docType, keyword, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((one) => one !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? [] : items.map((item) => item.id));
  };

  return (
    <>
      <div className={styles.document_browser_head}>
        <div className={styles.document_browser_head_text}>
          <h1 className={`${styles.document_browser_head_title} font_h1`}>문서함</h1>
          <p className={`${styles.document_browser_head_desc} font_body_m_r`}>
            저장한 이력서와 자기소개서를 여기서 관리해요.
          </p>
        </div>

        <div className={styles.document_browser_head_btns}>
          {isDeleteMode ? (
            <>
              <Link
                href='/mypage/documents'
                className={`${styles.document_browser_ghost_btn} font_body_l_b`}
                onClick={() => setSelectedIds([])}
              >
                취소
              </Link>

              <button
                type='button'
                className={`${styles.document_browser_ghost_btn} font_body_l_b`}
                onClick={toggleAll}
              >
                {isAllSelected ? '선택 해제' : '전체 선택'}
              </button>

              <button
                type='button'
                className={`${styles.document_browser_delete_btn} font_body_l_b`}
                disabled={selectedIds.length === 0}
              >
                선택 삭제{selectedIds.length > 0 && ` ${selectedIds.length}`}
              </button>
            </>
          ) : (
            <>
              <Link
                href='/mypage/documents?mode=delete'
                className={`${styles.document_browser_ghost_btn} font_body_l_b`}
              >
                <span className='material-symbols-sharp' aria-hidden='true'>
                  delete
                </span>
                삭제
              </Link>

              <Link
                href='/resume/free-form'
                className={`${styles.document_browser_new_btn} font_body_l_b`}
              >
                <span className='material-symbols-sharp' aria-hidden='true'>
                  add
                </span>
                새로 작성하기
              </Link>
            </>
          )}
        </div>
      </div>

      {isDeleteMode && (
        <p className={`${styles.document_browser_notice} font_body_m_b`} role='status'>
          <span className='material-symbols-sharp' aria-hidden='true'>
            info
          </span>
          삭제 모드입니다. 삭제할 문서를 체크한 뒤 우측 상단 “선택 삭제”를 눌러주세요.
        </p>
      )}

      <div className={styles.document_browser}>
        <div className={styles.document_browser_filter}>
          <div className={styles.document_browser_chips}>
            {DOC_TYPES.map((type) => (
              <FilterChip
                key={type.value || 'all'}
                label={type.label}
                isActive={docType === type.value}
                onClick={() => updateQuery({ docType: type.value, page: 1 })}
              />
            ))}

            {isDeleteMode && (
              <span className={`${styles.document_browser_guide} font_body_m_b`}>
                삭제할 문서를 선택해주세요
              </span>
            )}
          </div>

          <div className={styles.document_browser_tools}>
            <SearchPill
              key={keyword}
              placeholder='문서 이름으로 검색'
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
          <ul className={styles.document_browser_list}>
            {items.map((item, index) => (
              <DocumentRow
                key={item.id}
                id={item.id}
                index={(currentPage - 1) * PAGE_SIZE + index + 1}
                docType={item.docType}
                title={item.title}
                updatedAt={item.updatedAt}
                isSelected={selectedIds.includes(item.id)}
                onToggle={isDeleteMode ? () => toggleOne(item.id) : undefined}
              />
            ))}
          </ul>
        ) : (
          <div className={styles.document_browser_empty}>
            <span
              className={`material-symbols-sharp ${styles.document_browser_empty_icon}`}
              aria-hidden='true'
            >
              folder_open
            </span>
            <p className={`${styles.document_browser_empty_title} font_h4`}>저장한 문서가 없습니다</p>
            <p className={`${styles.document_browser_empty_desc} font_body_m_r`}>
              새로 작성하기를 눌러 이력서나 자기소개서를 만들어보세요.
            </p>
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.document_browser_pagination}>
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
