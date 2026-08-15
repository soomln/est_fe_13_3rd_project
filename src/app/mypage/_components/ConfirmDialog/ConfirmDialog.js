'use client';

import { useEffect } from 'react';

import styles from './ConfirmDialog.module.sass';

// 되돌릴 수 없는 일을 하기 전에 한 번 더 묻는 창
export default function ConfirmDialog({ isOpen, title, desc, confirmLabel, onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.confirm_dialog_overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div className={styles.confirm_dialog} role='alertdialog' aria-label={title}>
        <p className={`${styles.confirm_dialog_title} font_h4`}>{title}</p>
        <p className={`${styles.confirm_dialog_desc} font_body_m_r`}>{desc}</p>

        <div className={styles.confirm_dialog_btns}>
          <button
            type='button'
            className={`${styles.confirm_dialog_cancel} font_body_l_b`}
            onClick={onCancel}
          >
            취소
          </button>

          <button
            type='button'
            className={`${styles.confirm_dialog_confirm} font_body_l_b`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
