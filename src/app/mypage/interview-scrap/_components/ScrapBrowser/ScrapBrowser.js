'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Pagination from '@/app/_components/common/Pagination';
import SearchPill from '@/app/mypage/_components/SearchPill';
import SortPill from '@/app/mypage/_components/SortPill';
import ScrapRow from '@/app/mypage/_components/ScrapRow';
import styles from './ScrapBrowser.module.sass';

const PAGE_SIZE = 10;

const SORTS = { 최신순: 'latest', 오래된순: 'oldest' };

const SORTERS = {
  latest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
};

// 쿼리에서 생략하는 기본값
const DEFAULTS = { q: '', sort: 'latest', page: '1' };

export default function ScrapBrowser({ scraps }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openIds, setOpenIds] = useState([]);

  const keyword = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort') ?? '';
  const sort = SORTERS[sortParam] ? sortParam : 'latest';
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

  // 질문·내 답변·AI 피드백을 모두 훑는다
  const filtered = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    return scraps
      .filter((item) =>
        text
          ? [item.question, item.answer, item.feedback].some((field) =>
              field.toLowerCase().includes(text),
            )
          : true,
      )
      .sort(SORTERS[sort]);
  }, [scraps, keyword, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const items = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleOpen = (id) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((one) => one !== id) : [...prev, id]));
  };

  return (
    <>
      <div className={styles.scrap_browser_head}>
        <div className={styles.scrap_browser_head_text}>
          <h1 className={`${styles.scrap_browser_head_title} font_h1`}>AI 면접 스크랩</h1>
          <p className={`${styles.scrap_browser_head_desc} font_body_m_r`}>
            AI 면접 연습 중 스크랩한 면접 질문과 답변 그리고 피드백을 모아뒀어요.
          </p>
        </div>

        <div className={styles.scrap_browser_head_btns}>
          <Link
            href='/mypage/interview-scrap?mode=delete'
            className={`${styles.scrap_browser_ghost_btn} font_body_l_b`}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              delete
            </span>
            삭제
          </Link>

          <Link href='/interview' className={`${styles.scrap_browser_practice_btn} font_body_l_b`}>
            AI 면접 연습하기
            <span className='material-symbols-sharp' aria-hidden='true'>
              arrow_forward
            </span>
          </Link>
        </div>
      </div>

      <div className={styles.scrap_browser}>
        <div className={styles.scrap_browser_filter}>
          <p className={`${styles.scrap_browser_count} font_h4`}>총 {filtered.length}개</p>

          <div className={styles.scrap_browser_tools}>
            <SearchPill
              key={keyword}
              placeholder='키워드로 검색'
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
          <ul className={styles.scrap_browser_list}>
            {items.map((item, index) => (
              <ScrapRow
                key={item.id}
                index={(currentPage - 1) * PAGE_SIZE + index + 1}
                question={item.question}
                answer={item.answer}
                feedback={item.feedback}
                createdAt={item.createdAt}
                isOpen={openIds.includes(item.id)}
                onToggleOpen={() => toggleOpen(item.id)}
              />
            ))}
          </ul>
        ) : (
          <div className={styles.scrap_browser_empty}>
            <span
              className={`material-symbols-sharp ${styles.scrap_browser_empty_icon}`}
              aria-hidden='true'
            >
              bookmark
            </span>
            <p className={`${styles.scrap_browser_empty_title} font_h4`}>
              {keyword ? '검색 결과가 없습니다' : '스크랩한 질문이 없습니다'}
            </p>
            <p className={`${styles.scrap_browser_empty_desc} font_body_m_r`}>
              {keyword
                ? '다른 키워드로 찾아보세요.'
                : 'AI 면접 연습 중 마음에 드는 질문을 스크랩해보세요.'}
            </p>
          </div>
        )}

        <div className={styles.scrap_browser_cta}>
          <div className={styles.scrap_browser_cta_text}>
            <img
              src='/images/mypage/interview_scrap_cta_icon.png'
              alt=''
              className={styles.scrap_browser_cta_icon}
            />
            <div className={styles.scrap_browser_cta_copy}>
              <p className={`${styles.scrap_browser_cta_title} font_h4`}>
                AI 면접 연습을 통해 더 확실하게 준비해보세요!
              </p>
              <p className={`${styles.scrap_browser_cta_desc} font_body_s_r`}>
                반복 학습을 통해 면접 실력을 향상시킬 수 있습니다.
              </p>
            </div>
          </div>

          <Link href='/interview' className={`${styles.scrap_browser_cta_btn} font_body_l_b`}>
            AI 면접 연습하기
            <span className='material-symbols-sharp' aria-hidden='true'>
              arrow_forward
            </span>
          </Link>
        </div>

        {items.length > 0 && (
          <div className={styles.scrap_browser_pagination}>
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
