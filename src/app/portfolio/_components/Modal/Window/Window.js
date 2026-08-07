import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Window.module.sass';

import ToastMessage from '../ToastMessage';
import TabGroup from '../TabGroup';
import Contents from '../Contents';
import ActionBtnGroup from '../ActionBtnGroup';

export default function DetailModal({ isOpen, onClose, data }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const contentsRef = useRef(null);

  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen || !data) return null;

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
          onClose(data);
        }}
      ></div>
      <ToastMessage isVisible={isToastVisible} message={toastMessage} />
      <div className={`container ${styles.modalBox}`}>
        <div className={`${styles.contents_wrapper}`}>
          <TabGroup activeTab={activeTab} onChangeTab={setActiveTab} />
          <Contents contentsRef={contentsRef} />
        </div>
        <ActionBtnGroup contentsRef={contentsRef} showToast={showShareToast} />
      </div>
    </div>,
    document.body,
  );
}
