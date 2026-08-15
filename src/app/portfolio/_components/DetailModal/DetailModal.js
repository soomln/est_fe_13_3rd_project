'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './DetailModal.module.sass';

import ToastMessage from '../ToastMessage';
import TabGroup from '../TabGroup';
import Contents from '../Contents';
import ReactionBtnGroup from '../ReactionBtnGroup';

import { getPortfolio } from '@backend/lib/api/portfolio';

export default function DetailModal({ isOpen, onClose, itemID, updateReactionCount }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [item, setItem] = useState(null);

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

  const showShareToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);

    setTimeout(() => {
      setIsToastVisible(false);
    }, 2000);
  };

  if (!mounted || !isOpen || !item) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.backdrop} onClick={onClose} />

      <ToastMessage isVisible={isToastVisible} message={toastMessage} />

      <div className={`container ${styles.modalBox}`}>
        <div className={styles.contents_wrapper}>
          <TabGroup bgColor={item.bgColor} activeTab={activeTab} onChangeTab={setActiveTab} />

          <Contents item={item} contentsRef={contentsRef} />
        </div>

        <ReactionBtnGroup
          item={item}
          contentsRef={contentsRef}
          showToast={showShareToast}
          updateReactionCount={handleUpdateReactionCount}
        />
      </div>
    </div>,
    document.body,
  );
}
