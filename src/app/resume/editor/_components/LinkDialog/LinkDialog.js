'use client';

import { useEffect, useState } from 'react';

import useDialog from '@/app/mypage/_lib/useDialog';
import styles from './LinkDialog.module.sass';

// 주소를 받는 작은 창. 링크와 이미지가 같이 쓴다
export default function LinkDialog({
  isOpen,
  current,
  title = '링크 주소',
  placeholder = 'https://example.com',
  hint = '비워두고 확인하면 링크가 풀려요.',
  onConfirm,
  onCancel,
}) {
  const [url, setUrl] = useState('');

  useDialog(isOpen, onCancel);

  useEffect(() => {
    if (isOpen) setUrl(current ?? '');
  }, [isOpen, current]);

  if (!isOpen) return null;

  const submit = (event) => {
    event.preventDefault();
    onConfirm(url.trim());
  };

  return (
    <div
      className={styles.link_dialog_overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <form className={styles.link_dialog} onSubmit={submit}>
        <p className={`${styles.link_dialog_title} font_h4`}>{title}</p>

        <input
          type='text'
          className={`${styles.link_dialog_input} font_body_m_r`}
          placeholder={placeholder}
          aria-label={title}
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />

        {hint && <p className={`${styles.link_dialog_hint} font_body_s_b`}>{hint}</p>}

        <div className={styles.link_dialog_btns}>
          <button
            type='button'
            className={`${styles.link_dialog_cancel} font_body_l_b`}
            onClick={onCancel}
          >
            취소
          </button>
          <button type='submit' className={`${styles.link_dialog_confirm} font_body_l_b`}>
            확인
          </button>
        </div>
      </form>
    </div>
  );
}
