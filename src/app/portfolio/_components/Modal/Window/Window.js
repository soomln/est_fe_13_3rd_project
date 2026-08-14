'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Window.module.sass';

import ToastMessage from '../ToastMessage';
import TabGroup from '../TabGroup';
import Contents from '../Contents';
import ActionBtnGroup from '../ActionBtnGroup';

import { getPortfolio } from '@backend/lib/api/portfolio';

export default function DetailModal({ isOpen, onClose, itemID }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const contentsRef = useRef(null);

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [item, setItem] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!itemID) return;

    const getItem = async () => {
      setItem(null);

      const data = await getPortfolio(itemID);
      setItem(data);
    };

    getItem();
  }, [itemID]);

  console.log(item);
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !item) return null;

  const showShareToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);

    setTimeout(() => {
      setIsToastVisible(false);
    }, 2000);
  };

  return createPortal(
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        onClick={() => {
          onClose(item);
        }}
      ></div>
      <ToastMessage isVisible={isToastVisible} message={toastMessage} />
      <div className={`container ${styles.modalBox}`}>
        <div className={`${styles.contents_wrapper}`}>
          <TabGroup bgColor={item.bgColor} activeTab={activeTab} onChangeTab={setActiveTab} />
          <Contents item={item} contentsRef={contentsRef} />
        </div>
        <ActionBtnGroup contentsRef={contentsRef} showToast={showShareToast} />
      </div>
    </div>,
    document.body,
  );
}
