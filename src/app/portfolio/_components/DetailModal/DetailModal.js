'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useToast from '@/hooks/useToast';

import ToastMessage from '../ToastMessage';
import TabGroup from '../TabGroup';
import Contents from '../Contents';
import ReactionBtnGroup from '../ReactionBtnGroup';

import { getPortfolio } from '@backend/lib/api/portfolio';

import styles from './DetailModal.module.sass';

export default function DetailModal({ isOpen, onClose, itemID, updateReactionCount }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [item, setItem] = useState(null);

  const { isToastVisible, toastMessage, showToast } = useToast();

  const contentsRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!itemID) return;

    const getItem = async () => {
      try {
        const data = await getPortfolio(itemID);
        setItem(data);
      } catch (error) {
        console.error('포트폴리오 상세 조회 실패:', error);
      }
    };

    getItem();
  }, [itemID]);

  const handleUpdateReactionCount = (portfolioId, field, amount) => {
    // page.js의 목록 데이터 갱신
    updateReactionCount(portfolioId, field, amount);

    // Window의 상세 데이터 갱신
    setItem((prev) => {
      if (!prev || prev.id !== portfolioId) return prev;

      return {
        ...prev,
        [field]: prev[field] + amount,
      };
    });
  };

  if (!mounted || !isOpen || !item) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      {isToastVisible && <ToastMessage message={toastMessage} />}

      <div className={`container ${styles.modalBox}`}>
        <div className={styles.contents_wrapper}>
          <TabGroup bgColor={item.bgColor} activeTab={activeTab} onChangeTab={setActiveTab} />

          <Contents item={item} activeTab={activeTab} contentsRef={contentsRef} />
        </div>

        <ReactionBtnGroup
          item={item}
          contentsRef={contentsRef}
          showToast={showToast}
          updateReactionCount={handleUpdateReactionCount}
        />
      </div>
    </div>,
    document.body,
  );
}
