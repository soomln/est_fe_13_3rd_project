import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './Window.module.sass';

import TabGroup from '../TabGroup';

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
        <TabGroup activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>
    </div>,
    document.body,
  );
}
