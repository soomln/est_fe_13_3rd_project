'use client';

import { useEffect } from 'react';

import DEFAULT_AVATARS from '@/app/mypage/_lib/defaultAvatars';
import styles from './AvatarPicker.module.sass';

// 기본 프로필 이미지 중에서 고르는 창
export default function AvatarPicker({ isOpen, current, onSelect, onClose }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.avatar_picker_overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.avatar_picker} role='dialog' aria-label='기본 이미지 선택'>
        <p className={`${styles.avatar_picker_title} font_h4`}>기본 이미지 선택</p>

        <ul className={styles.avatar_picker_list}>
          {DEFAULT_AVATARS.map((url, index) => (
            <li key={url}>
              <button
                type='button'
                className={`${styles.avatar_picker_item} ${
                  url === current ? styles.avatar_picker_item_on : ''
                }`}
                aria-label={`기본 이미지 ${index + 1}`}
                aria-pressed={url === current}
                onClick={() => onSelect(url)}
              >
                <img src={url} alt='' className={styles.avatar_picker_img} />
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.avatar_picker_foot}>
          <button
            type='button'
            className={`${styles.avatar_picker_close} font_body_l_b`}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
