'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { listMyScraps, removeQaScraps } from '@backend/lib/api/interview';
import Pagination from '@/app/_components/common/Pagination';
import SearchPill from '@/app/mypage/_components/SearchPill';
import SortPill from '@/app/mypage/_components/SortPill';
import ScrapRow from '@/app/mypage/_components/ScrapRow';
import Toast from '@/app/mypage/_components/Toast';
import ErrorState from '@/app/mypage/_components/ErrorState';
import styles from './ScrapBrowser.module.sass';

const PAGE_SIZE = 10;

const SORTS = { 최신순: 'latest', 오래된순: 'oldest' };

// 쿼리에서 생략하는 기본값
const DEFAULTS = { q: '', sort: 'latest', page: '1' };

export default function ScrapBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openIds, setOpenIds] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [data, setData] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState('');

  const isDeleteMode = searchParams.get('mode') === 'delete';
  const keyword = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort') ?? '';
  const sort = Object.values(SORTS).includes(sortParam) ? sortParam : 'latest';
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

  // 거르기·정렬·쪽 나누기는 서버가 한다
  useEffect(() => {
    let alive = true;
    setStatus('loading');

    listMyScraps({ q: keyword || undefined, sort, page, pageSize: PAGE_SIZE })
      .then((result) => {
        if (!alive) return;
        setData(result);
        setStatus('ready');

        // 마지막 쪽 항목을 다 지우면 빈 화면이 되니 있는 쪽으로 되돌린다
        const lastPage = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
        if (page > lastPage) updateQuery({ page: lastPage });
      })
      .catch(() => {
        if (!alive) return;
        setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, [keyword, sort, page, reloadKey]);

  const items = data.items;
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleOpen = (id) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((one) => one !== id) : [...prev, id]));
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((one) => one !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? [] : items.map((item) => item.id));
  };

  // 삭제모드는 전부 펼친 채로 시작한다. 그래서 openIds 를 "접은 것" 목록으로 뒤집어 쓴다
  const isRowOpen = (id) => (isDeleteMode ? !openIds.includes(id) : openIds.includes(id));

  // 모드가 바뀌면 펼침·선택 상태를 비운다
  const resetView = () => {
    setSelectedIds([]);
    setOpenIds([]);
  };

  // 지운 뒤에는 삭제모드를 빠져나가고 알림을 띄운다
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;

    try {
      await removeQaScraps(selectedIds);
      resetView();
      setToast(`${count}개 질문의 스크랩을 해제했어요`);
      updateQuery({ mode: '' });
      setReloadKey((prev) => prev + 1);
    } catch {
      setStatus('error');
    }
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
          {isDeleteMode ? (
            <>
              <Link
                href='/mypage/interview-scrap'
                className={`${styles.scrap_browser_ghost_btn} font_body_l_b`}
                onClick={resetView}
              >
                취소
              </Link>

              <button
                type='button'
                className={`${styles.scrap_browser_ghost_btn} font_body_l_b`}
                onClick={toggleAll}
              >
                {isAllSelected ? '선택 해제' : '전체 선택'}
              </button>

              <button
                type='button'
                className={`${styles.scrap_browser_delete_btn} font_body_l_b`}
                disabled={selectedIds.length === 0}
                onClick={handleDelete}
              >
                선택 삭제{selectedIds.length > 0 && ` ${selectedIds.length}`}
              </button>
            </>
          ) : (
            <>
              <Link
                href='/mypage/interview-scrap?mode=delete'
                className={`${styles.scrap_browser_ghost_btn} font_body_l_b`}
                onClick={resetView}
              >
                <span className='material-symbols-sharp' aria-hidden='true'>
                  delete
                </span>
                삭제
              </Link>

              <Link
                href='/interview'
                className={`${styles.scrap_browser_practice_btn} font_body_l_b`}
              >
                AI 면접 연습하기
                <span className='material-symbols-sharp' aria-hidden='true'>
                  arrow_forward
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      <Toast message={toast} onHide={() => setToast('')} />

      {isDeleteMode && (
        <p className={`${styles.scrap_browser_notice} font_body_m_b`} role='status'>
          <span className='material-symbols-sharp' aria-hidden='true'>
            info
          </span>
          삭제 모드입니다. 삭제할 질문을 체크한 뒤 우측 상단 “선택 삭제”를 눌러주세요.
        </p>
      )}

      <div className={styles.scrap_browser}>
        <div className={styles.scrap_browser_filter}>
          <div className={styles.scrap_browser_labels}>
            <p className={`${styles.scrap_browser_count} font_h4`}>총 {data.total}개</p>

            {isDeleteMode && (
              <span className={`${styles.scrap_browser_guide} font_body_m_b`}>
                삭제할 질문을 선택해주세요
              </span>
            )}
          </div>

          <div className={styles.scrap_browser_tools}>
            <SearchPill
              keyword={keyword}
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

        {status === 'loading' && (
          <p className={`${styles.scrap_browser_state} font_body_m_r`} role='status'>
            불러오는 중이에요…
          </p>
        )}

        {status === 'error' && (
          <ErrorState
            onRetry={() => setReloadKey((prev) => prev + 1)}
          />
        )}

        {status === 'ready' && items.length > 0 ? (
          <ul className={styles.scrap_browser_list}>
            {items.map((item, index) => (
              <ScrapRow
                key={item.id}
                index={(currentPage - 1) * PAGE_SIZE + index + 1}
                question={item.question}
                answer={item.answer}
                feedback={item.feedbackText}
                createdAt={item.date}
                isOpen={isRowOpen(item.id)}
                onToggleOpen={() => toggleOpen(item.id)}
                isSelected={selectedIds.includes(item.id)}
                onToggle={isDeleteMode ? () => toggleOne(item.id) : undefined}
              />
            ))}
          </ul>
        ) : status === 'ready' ? (
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
        ) : null}

        {!isDeleteMode && (
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
        )}

        {status === 'ready' && items.length > 0 && (
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
