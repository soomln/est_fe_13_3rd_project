import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Window.module.sass';

import TabGroup from '@/app/portfolio/_components/Modal/TabGroup';
import Contents from '@/app/portfolio/_components/Modal/Contents';
import ActionBtnGroup from '@/app/portfolio/_components/Modal/ActionBtnGroup';

export default function DetailModal({ isOpen, onClose, data }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');

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

  return createPortal(
    <div className={styles.overlay}>
      <div
        className={styles.backdrop}
        onClick={() => {
          onClose(data);
        }}
      />
      <div className={`container ${styles.modalBox}`}>
        <div className={`${styles.contents_wrapper}`}>
          <TabGroup activeTab={activeTab} onChangeTab={setActiveTab} />
          <Contents />
        </div>
        <ActionBtnGroup />
      </div>
    </div>,
    document.body,
  );
}
