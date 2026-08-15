'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { listMyDocuments, deleteDocuments } from '@backend/lib/api/documents';
import Pagination from '@/app/_components/common/Pagination';
import FilterChip from '@/app/mypage/_components/FilterChip';
import SearchPill from '@/app/mypage/_components/SearchPill';
import SortPill from '@/app/mypage/_components/SortPill';
import DocumentRow from '@/app/mypage/_components/DocumentRow';
import DocumentPreview from '@/app/mypage/_components/DocumentPreview';
import Toast from '@/app/mypage/_components/Toast';
import ConfirmDialog from '@/app/mypage/_components/ConfirmDialog';
import formatDate from '@/app/mypage/_lib/formatDate';
import styles from './DocumentBrowser.module.sass';

const PAGE_SIZE = 10;

const DOC_TYPES = [
  { value: '', label: '전체' },
  { value: 'resume', label: '이력서' },
  { value: 'cover_letter', label: '자기소개서' },
];

const SORTS = { 등록순: 'created', 최신순: 'latest', 이름순: 'title' };

// 쿼리에서 생략하는 기본값
const DEFAULTS = { docType: '', q: '', sort: 'created', page: '1' };

export default function DocumentBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState([]);
  const [data, setData] = useState({ items: [], total: 0 });
  const [status, setStatus] = useState('loading');
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  const isDeleteMode = searchParams.get('mode') === 'delete';
  const docType = searchParams.get('docType') ?? '';
  const keyword = searchParams.get('q') ?? '';
  const sortParam = searchParams.get('sort') ?? '';
  const sort = Object.values(SORTS).includes(sortParam) ? sortParam : 'created';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const sortLabel = Object.keys(SORTS).find((label) => SORTS[label] === sort);

  // 거르기·정렬·쪽 나누기는 서버가 한다
  useEffect(() => {
    let alive = true;
    setStatus('loading');

    listMyDocuments({ docType: docType || undefined, q: keyword || undefined, sort, page, pageSize: PAGE_SIZE })
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
  }, [docType, keyword, sort, page, reloadKey]);

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

  const items = data.items;
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const isAllSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((one) => one !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedIds(isAllSelected ? [] : items.map((item) => item.id));
  };

  // 지운 뒤에는 삭제모드를 빠져나가고 알림을 띄운다
  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    setIsConfirming(false);

    try {
      await deleteDocuments(selectedIds);
      setSelectedIds([]);
      setToast(`${count}개 문서를 삭제했어요`);
      updateQuery({ mode: '' });
      setReloadKey((prev) => prev + 1);
    } catch {
      setStatus('error');
    }
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
                onClick={() => setIsConfirming(true)}
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

      <Toast message={toast} onHide={() => setToast('')} />

      <ConfirmDialog
        isOpen={isConfirming}
        title={`문서 ${selectedIds.length}개를 삭제할까요?`}
        desc='지운 문서는 되돌릴 수 없어요.'
        confirmLabel='삭제하기'
        onConfirm={handleDelete}
        onCancel={() => setIsConfirming(false)}
      />
      <DocumentPreview id={previewId} onClose={() => setPreviewId(null)} />

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

        {status === 'loading' && (
          <p className={`${styles.document_browser_state} font_body_m_r`} role='status'>
            불러오는 중이에요…
          </p>
        )}

        {status === 'error' && (
          <div className={styles.document_browser_empty}>
            <span
              className={`material-symbols-sharp ${styles.document_browser_empty_icon}`}
              aria-hidden='true'
            >
              error
            </span>
            <p className={`${styles.document_browser_empty_title} font_h4`}>불러오지 못했어요</p>
            <p className={`${styles.document_browser_empty_desc} font_body_m_r`}>
              잠시 뒤 다시 시도해주세요.
            </p>
            <button
              type='button'
              className={`${styles.document_browser_ghost_btn} ${styles.document_browser_retry} font_body_l_b`}
              onClick={() => setReloadKey((prev) => prev + 1)}
            >
              다시 불러오기
            </button>
          </div>
        )}

        {status === 'ready' && items.length > 0 && (
          <ul className={styles.document_browser_list}>
            {items.map((item, index) => (
              <DocumentRow
                key={item.id}
                id={item.id}
                index={(currentPage - 1) * PAGE_SIZE + index + 1}
                docType={item.docType}
                title={item.title}
                updatedAt={formatDate(item.updatedAt)}
                isSelected={selectedIds.includes(item.id)}
                onToggle={isDeleteMode ? () => toggleOne(item.id) : undefined}
                onPreview={() => setPreviewId(item.id)}
              />
            ))}
          </ul>
        )}

        {status === 'ready' && items.length === 0 && (
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

        {status === 'ready' && items.length > 0 && (
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
