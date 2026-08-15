'use client';

import { useEffect } from 'react';

// 창이 떠 있는 동안 Esc 로 닫고 뒤 배경 스크롤을 막는다
export default function useDialog(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    // 스크롤 주체가 html 이라 body 만 막으면 안 통한다
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      root.style.overflow = previous;
    };
  }, [isOpen, onClose]);
}
