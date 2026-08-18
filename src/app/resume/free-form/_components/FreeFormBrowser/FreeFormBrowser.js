'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { listTemplates } from '@backend/lib/api/templates';
import Pagination from '@/app/_components/common/Pagination';
import ErrorState from '@/app/mypage/_components/ErrorState';
import CategoryBtn from '@/app/resume/_components/CategoryBtn';
import TemplateCard from '@/app/resume/_components/TemplateCard';
import SearchBar from '@/app/resume/free-form/_components/SearchBar';
import SortBtn from '@/app/resume/free-form/_components/SortBtn';
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

const SORTS = SORT_OPTIONS.map((option) => option.value);

// 쿼리에서 생략하는 기본값
const DEFAULTS = { docType: '', q: '', sort: 'popular', page: '1' };

export default function FreeFormBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState({ items: [], total: 0 });
  const [counts, setCounts] = useState({});
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);

  const docType = searchParams.get('docType') ?? '';
  const keyword = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort') ?? '';
  const sort = SORTS.includes(sortParam) ? sortParam : 'popular';
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

  // 거르기·검색·정렬·쪽나누기는 서버가 한다
  useEffect(() => {
    let alive = true;
    setStatus('loading');

    listTemplates({ docType: docType || undefined, q: keyword || undefined, sort, page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (!alive) return;
        setData(result);
        setStatus('ready');

        const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
        if (page > lastPage) updateQuery({ page: lastPage });
      })
      .catch(() => {
        if (alive) setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, [docType, keyword, sort, page, reloadKey]);

  // 분류별 개수는 검색어에 맞춰 따로 센다
  useEffect(() => {
    let alive = true;

    Promise.all(
      DOC_TYPES.map((type) =>
        listTemplates({ docType: type.value || undefined, q: keyword || undefined, pageSize: 1 })
          .then((result) => [type.value, result.total])
          .catch(() => [type.value, 0]),
      ),
    ).then((pairs) => {
      if (alive) setCounts(Object.fromEntries(pairs));
    });

    return () => {
      alive = false;
    };
  }, [keyword, reloadKey]);

  const items = data.items;
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

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

      {status === 'loading' && (
        <p className={`${styles.free_form_state} font_body_m_r`} role='status'>
          불러오는 중이에요…
        </p>
      )}

      {status === 'error' && (
        <ErrorState title='양식을 불러오지 못했어요' onRetry={() => setReloadKey((prev) => prev + 1)} />
      )}

      {status === 'ready' && items.length > 0 ? (
        <ul className={styles.free_form_grid}>
          {items.map((item) => (
            <TemplateCard
              key={item.id}
              id={item.id}
              type={item.docType === 'resume' ? '이력서' : '자기소개서'}
              title={item.title}
              views={item.views}
              thumbnailUrl={item.thumbnail}
              isBookmarked={item.bookmarkedByMe}
            />
          ))}
        </ul>
      ) : status === 'ready' ? (
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
      ) : null}

      {status === 'ready' && items.length > 0 && (
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
