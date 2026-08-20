'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import useToast from '@/hooks/useToast';

import ToastMessage from '../ToastMessage';
import TabGroup from '../TabGroup';
import Contents from '../Contents';
import ReactionBtnGroup from '../ReactionBtnGroup';

import { getPortfolio } from '@backend/lib/api/portfolio';

import styles from './DetailModal.module.sass';

export default function DetailModal({
  isOpen,
  onClose,
  itemID,
  isLiked = false,
  isBookmarked = false,
  updateReaction,
  isMyPage = false,
}) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [item, setItem] = useState(null);

  const router = useRouter();

  const { isToastVisible, toastMessage, showToast } = useToast();

  const contentsRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;

    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !item) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      contentsRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen, item]);

  useEffect(() => {
    if (!itemID) {
      setItem(null);
      return;
    }

    const getItem = async () => {
      try {
        const data = await getPortfolio(itemID);

        setItem({
          ...data,
          isLiked,
          isBookmarked,
        });
      } catch (error) {
        console.error('포트폴리오 상세 조회 실패:', error);
      }
    };

    getItem();
  }, [itemID, isLiked, isBookmarked]);

  const onEdit = () => {
    if (!item) return;

    router.push(`/portfolio/upload?id=${item.id}`);
  };

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    contentsRef.current?.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  };

  const handleUpdateReaction = (portfolioId, type, isActive) => {
    // page.js 목록 데이터 갱신
    updateReaction(portfolioId, type, isActive);

    // 모달 상세 데이터 갱신
    setItem((prev) => {
      if (!prev || prev.id !== portfolioId) {
        return prev;
      }

      if (type === 'like') {
        return {
          ...prev,
          isLiked: isActive,
          likeCount: prev.likeCount + (isActive ? 1 : -1),
        };
      }

      if (type === 'bookmark') {
        return {
          ...prev,
          isBookmarked: isActive,
          bookmarkCount: prev.bookmarkCount + (isActive ? 1 : -1),
        };
      }

      return prev;
    });
  };

  if (!mounted || !isOpen || !item) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.backdrop} onPointerDown={onClose} />

      {isToastVisible && <ToastMessage message={toastMessage} />}

      <div
        className={`container ${styles.modalBox}`}
        role='dialog'
        aria-modal='true'
        aria-label='포트폴리오 상세'
      >
        <div className={styles.contents_wrapper}>
          <div className={styles.tab_header}>
            <TabGroup bgColor={item.bgColor} activeTab={activeTab} onChangeTab={handleChangeTab} />

            {isMyPage && (
              <button type='button' className={`${styles.edit_btn} font_body_m_b`} onClick={onEdit}>
                수정하기
              </button>
            )}
          </div>

          <Contents item={item} activeTab={activeTab} contentsRef={contentsRef} />
        </div>

        <ReactionBtnGroup
          item={item}
          contentsRef={contentsRef}
          showToast={showToast}
          updateReaction={handleUpdateReaction}
        />
      </div>
    </div>,
    document.body,
  );
}
