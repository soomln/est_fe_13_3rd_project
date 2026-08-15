'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Pagination from '@/app/_components/common/Pagination';
import { listMyScrappedCompanies, removeCompanyBookmarks } from '@backend/lib/api/mypage';
import { listMyScrappedPosts, removePostScraps } from '@backend/lib/api/posts';
import CompanyCard from '@/app/mypage/_components/CompanyCard';
import FilterChip from '@/app/mypage/_components/FilterChip';
import QbankCard from '@/app/mypage/_components/QbankCard';
import Toast from '@/app/mypage/_components/Toast';
import styles from './ActivityBrowser.module.sass';

// 카드 높이가 달라서 탭마다 개수를 다르게 둔다
const PAGE_SIZE = { company: 9, qbank: 5 };

const TABS = [
  { value: '', label: '스크랩한 기업' },
  { value: 'qbank', label: '면접 질문 족보' },
];

// 주의: 정렬과 검색은 서버가 아직 지원하지 않는다 (docs/plans/backend_requests.md)

// 쿼리에서 생략하는 기본값
const DEFAULTS = { tab: '', page: '1' };

export default function ActivityBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedIds, setSelectedIds] = useState([]);
  const [data, setData] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState('');

  const isDeleteMode = searchParams.get('mode') === 'delete';
  const isQbank = searchParams.get('tab') === 'qbank';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
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

  // 기업·족보 모두 스크랩한 목록이다
  useEffect(() => {
    let alive = true;
    setStatus('loading');

    const load = isQbank
      ? listMyScrappedPosts({ type: 'qbank', page, pageSize })
      : listMyScrappedCompanies({ page, pageSize });

    load
      .then((result) => {
        if (!alive) return;
        setData(result);
        setStatus('ready');

        // 마지막 쪽 항목을 다 지우면 빈 화면이 되니 있는 쪽으로 되돌린다
        const lastPage = Math.max(1, Math.ceil(result.total / pageSize));
        if (page > lastPage) updateQuery({ page: lastPage });
      })
      .catch(() => {
        if (!alive) return;
        setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, [isQbank, page, pageSize, reloadKey]);

  // 서버가 주는 이름과 카드가 쓰는 이름이 달라서 맞춰준다
  const items = isQbank
    ? data.items.map((item) => ({ ...item, createdAt: item.date }))
    : data.items.map((item) => ({
        ...item,
        industry: item.category,
        logoUrl: item.logo,
        employeeCount: item.employees,
        reviewCount: item.review,
        qbankCount: item.jokbo,
      }));

  const totalPages = Math.max(1, Math.ceil(data.total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((one) => one !== id) : [...prev, id]));
  };

  // 스크랩 해제만 한다. 원본 글이나 기업은 지우지 않는다
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;

    try {
      if (isQbank) await removePostScraps(selectedIds);
      else await removeCompanyBookmarks(selectedIds);

      setSelectedIds([]);
      setToast(`${count}개 스크랩을 해제했어요`);
      updateQuery({ mode: '' });
      setReloadKey((prev) => prev + 1);
    } catch {
      setStatus('error');
    }
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
                onClick={handleDelete}
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

      <Toast message={toast} onHide={() => setToast('')} />

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

        </div>

        {status === 'loading' && (
          <p className={`${styles.activity_browser_state} font_body_m_r`} role='status'>
            불러오는 중이에요…
          </p>
        )}

        {status === 'error' && (
          <div className={styles.activity_browser_empty}>
            <span
              className={`material-symbols-sharp ${styles.activity_browser_empty_icon}`}
              aria-hidden='true'
            >
              error
            </span>
            <p className={`${styles.activity_browser_empty_title} font_h4`}>불러오지 못했어요</p>
            <p className={`${styles.activity_browser_empty_desc} font_body_m_r`}>
              잠시 뒤 다시 시도해주세요.
            </p>
            <button
              type='button'
              className={`${styles.activity_browser_ghost_btn} ${styles.activity_browser_retry} font_body_l_b`}
              onClick={() => setReloadKey((prev) => prev + 1)}
            >
              다시 불러오기
            </button>
          </div>
        )}

        {status === 'ready' && items.length > 0 ? (
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

              return (
                <Link
                  key={item.id}
                  href={
                    isQbank
                      ? `/search-companies/detail/${item.companySlug}/interview-question/${item.id}`
                      : `/search-companies/detail/${item.slug}`
                  }
                  className={styles.activity_browser_link}
                >
                  {card}
                </Link>
              );
            })}
          </div>
        ) : status === 'ready' ? (
          <div className={styles.activity_browser_empty}>
            <span
              className={`material-symbols-sharp ${styles.activity_browser_empty_icon}`}
              aria-hidden='true'
            >
              {isQbank ? 'quiz' : 'apartment'}
            </span>
            <p className={`${styles.activity_browser_empty_title} font_h4`}>
              {isQbank ? '스크랩한 족보가 없습니다' : '스크랩한 기업이 없습니다'}
            </p>
            <p className={`${styles.activity_browser_empty_desc} font_body_m_r`}>
              {isQbank
                ? '기업 탐색에서 마음에 드는 족보를 스크랩해보세요.'
                : '기업 탐색에서 관심 있는 기업을 스크랩해보세요.'}
            </p>
          </div>
        ) : null}

        {status === 'ready' && items.length > 0 && (
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
