'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Pagination from '@/app/_components/common/Pagination';
import CategoryBtn from '@/app/resume/_components/CategoryBtn';
import TemplateCard from '@/app/resume/_components/TemplateCard';
import SearchBar from '@/app/resume/free_form/_components/SearchBar';
import SortBtn from '@/app/resume/free_form/_components/SortBtn';
import styles from './FreeFormBrowser.module.sass';

const PAGE_SIZE = 16;

const DOC_TYPES = [
  { value: '', label: '전체' },
  { value: 'resume', label: '이력서' },
  { value: 'cover_letter', label: '자기소개서' },
];

const SORT_OPTIONS = [
  { value: 'popular', label: '조회순' },
  { value: 'latest', label: '최신순' },
  { value: 'title', label: '이름순' },
];

const SORTERS = {
  popular: (a, b) => b.views - a.views,
  latest: (a, b) => a.order - b.order,
  title: (a, b) => a.title.localeCompare(b.title, 'ko'),
};

// 쿼리에서 생략하는 기본값
const DEFAULTS = { docType: '', q: '', sort: 'popular', page: '1' };

export default function FreeFormBrowser({ templates }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const docType = searchParams.get('docType') ?? '';
  const keyword = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort') ?? '';
  const sort = SORTERS[sortParam] ? sortParam : 'popular';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

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

  const counts = useMemo(
    () => ({
      '': templates.length,
      resume: templates.filter((item) => item.docType === 'resume').length,
      cover_letter: templates.filter((item) => item.docType === 'cover_letter').length,
    }),
    [templates]
  );

  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return templates
      .map((item, index) => ({ ...item, order: index }))
      .filter((item) => (docType ? item.docType === docType : true))
      .filter((item) => (text ? item.title.toLowerCase().includes(text) : true))
      .sort(SORTERS[sort]);
  }, [templates, docType, keyword, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <>
      <div className={styles.free_form_filter}>
        <div className={styles.free_form_chips}>
          {DOC_TYPES.map((type) => (
            <CategoryBtn
              key={type.value || 'all'}
              label={type.label}
              count={counts[type.value]}
              isActive={docType === type.value}
              onClick={() => updateQuery({ docType: type.value, page: 1 })}
            />
          ))}
        </div>

        <div className={styles.free_form_tools}>
          <SearchBar
            key={keyword}
            keyword={keyword}
            onSearch={(text) => updateQuery({ q: text, page: 1 })}
          />
          <SortBtn
            value={sort}
            options={SORT_OPTIONS}
            onChange={(value) => updateQuery({ sort: value, page: 1 })}
          />
        </div>
      </div>

      {items.length > 0 ? (
        <ul className={styles.free_form_grid}>
          {items.map((item) => (
            <TemplateCard
              key={item.id}
              id={item.id}
              type={item.docType === 'resume' ? '이력서' : '자기소개서'}
              title={item.title}
              views={item.views}
            />
          ))}
        </ul>
      ) : (
        <div className={styles.free_form_empty}>
          <span className={`material-symbols-sharp ${styles.free_form_empty_icon}`} aria-hidden='true'>
            search_off
          </span>
          <p className={`${styles.free_form_empty_title} font_h4`}>검색 결과가 없습니다</p>
          <p className={`${styles.free_form_empty_desc} font_body_m_r`}>
            다른 검색어나 분류로 다시 찾아보세요.
          </p>
          <button
            type='button'
            className={`${styles.free_form_empty_btn} font_body_m_b`}
            onClick={() => updateQuery({ docType: '', q: '', page: 1 })}
          >
            전체 보기
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className={styles.free_form_pagination}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(next) => updateQuery({ page: next })}
          />
        </div>
      )}
    </>
  );
}
