'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import {
  listMyPortfolios,
  listMyBookmarkedPortfolios,
  deletePortfolios,
  removePortfolioBookmarks,
} from '@backend/lib/api/portfolio';
import Pagination from '@/app/_components/common/Pagination';
import ErrorState from '@/app/mypage/_components/ErrorState';
import PortfolioCard from '@/app/_components/common/PortfolioCard';
import PortfolioDetailModal from '@/app/portfolio/_components/DetailModal';
import FilterChip from '@/app/mypage/_components/FilterChip';
import SortPill from '@/app/mypage/_components/SortPill';
import Toast from '@/app/mypage/_components/Toast';
import ConfirmDialog from '@/app/mypage/_components/ConfirmDialog';
import styles from './PortfolioBrowser.module.sass';

const PAGE_SIZE = 6;

const SCOPES = [
  { value: '', label: '내 포트폴리오' },
  { value: 'scrapped', label: '스크랩한 포트폴리오' },
];

// 주의: 등록순(오래된순)과 이름 검색은 서버가 아직 지원하지 않는다 (docs/plans/backend_requests.md)
const SORTS = { 최신순: 'latest', 인기순: 'popular' };

// 쿼리에서 생략하는 기본값
const DEFAULTS = { scope: '', sort: 'latest', page: '1' };

export default function PortfolioBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState([]);
  const [data, setData] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState('');
  const [previewId, setPreviewId] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const isDeleteMode = searchParams.get('mode') === 'delete';
  const scope = searchParams.get('scope') ?? '';
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

  const isScrapped = scope === 'scrapped';

  // 거르기·정렬·쪽 나누기는 서버가 한다
  useEffect(() => {
    let alive = true;
    setStatus('loading');

    const load = isScrapped
      ? listMyBookmarkedPortfolios({ page, pageSize: PAGE_SIZE })
      : listMyPortfolios({ sort, page, pageSize: PAGE_SIZE });

    load
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
  }, [isScrapped, sort, page, reloadKey]);

  const items = data.items;
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((one) => one !== id) : [...prev, id]));
  };

  // 카드 안 좋아요·북마크 숫자를 화면에서만 맞춰준다
  const updateReactionCount = (id, field, amount) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: item[field] + amount } : item)),
    }));
  };

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? [] : items.map((item) => item.id));
  };

  // 내 포트폴리오는 지우고, 스크랩한 것은 스크랩만 해제한다
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    setIsConfirming(false);

    try {
      if (isScrapped) await removePortfolioBookmarks(selectedIds);
      else await deletePortfolios(selectedIds);

      setSelectedIds([]);
      setToast(isScrapped ? `${count}개 스크랩을 해제했어요` : `${count}개 포트폴리오를 삭제했어요`);
      updateQuery({ mode: '' });
      setReloadKey((prev) => prev + 1);
    } catch {
      setStatus('error');
    }
  };

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
          {isDeleteMode ? (
            <>
              <Link
                href='/mypage/portfolio'
                className={`${styles.portfolio_browser_ghost_btn} font_body_l_b`}
                onClick={() => setSelectedIds([])}
              >
                취소
              </Link>

              <button
                type='button'
                className={`${styles.portfolio_browser_ghost_btn} font_body_l_b`}
                onClick={toggleAll}
              >
                {isAllSelected ? '선택 해제' : '전체 선택'}
              </button>

              <button
                type='button'
                className={`${styles.portfolio_browser_delete_btn} font_body_l_b`}
                disabled={selectedIds.length === 0}
                onClick={() => (isScrapped ? handleDelete() : setIsConfirming(true))}
              >
                선택 삭제{selectedIds.length > 0 && ` ${selectedIds.length}`}
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      <Toast message={toast} onHide={() => setToast('')} />

      <ConfirmDialog
        isOpen={isConfirming}
        title={`포트폴리오 ${selectedIds.length}개를 삭제할까요?`}
        desc='지운 포트폴리오는 되돌릴 수 없어요.'
        confirmLabel='삭제하기'
        onConfirm={handleDelete}
        onCancel={() => setIsConfirming(false)}
      />

      {/* key 를 주면 다른 카드를 열 때 이전 내용이 잠깐 보이지 않는다 */}
      <PortfolioDetailModal
        key={previewId}
        isOpen={Boolean(previewId)}
        itemID={previewId}
        onClose={() => setPreviewId(null)}
        isMyPage={true}
      />

      {isDeleteMode && (
        <p className={`${styles.portfolio_browser_notice} font_body_m_b`} role='status'>
          <span className='material-symbols-sharp' aria-hidden='true'>
            info
          </span>
          삭제 모드입니다. 삭제할 포트폴리오를 체크한 뒤 우측 상단 “선택 삭제”를 눌러주세요.
        </p>
      )}

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

            {isDeleteMode && (
              <span className={`${styles.portfolio_browser_guide} font_body_m_b`}>
                삭제할 포트폴리오를 선택해주세요
              </span>
            )}
          </div>

          {/* 주의: 이름 검색은 서버가 아직 지원하지 않아 뺐다 (docs/plans/backend_requests.md) */}
          <div className={styles.portfolio_browser_tools}>
            <SortPill
              options={Object.keys(SORTS)}
              value={sortLabel}
              onChange={(label) => updateQuery({ sort: SORTS[label], page: 1 })}
            />
          </div>
        </div>

        {status === 'loading' && (
          <p className={`${styles.portfolio_browser_state} font_body_m_r`} role='status'>
            불러오는 중이에요…
          </p>
        )}

        {status === 'error' && <ErrorState onRetry={() => setReloadKey((prev) => prev + 1)} />}

        {status === 'ready' && items.length > 0 ? (
          <ul className={styles.portfolio_browser_grid}>
            {items.map((item) => (
              <li key={item.id}>
                <PortfolioCard
                  item={item}
                  onClick={() => {
                    if (isDeleteMode) toggleOne(item.id);
                    else setPreviewId(item.id);
                  }}
                  isSelected={selectedIds.includes(item.id)}
                  onToggle={isDeleteMode ? () => toggleOne(item.id) : undefined}
                  updateReactionCount={updateReactionCount}
                />
              </li>
            ))}
          </ul>
        ) : status === 'ready' ? (
          <div className={styles.portfolio_browser_empty}>
            <span className={`material-symbols-sharp ${styles.portfolio_browser_empty_icon}`} aria-hidden='true'>
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
        ) : null}

        {status === 'ready' && items.length > 0 && (
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
