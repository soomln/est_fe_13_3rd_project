'use client';

import { useRouter } from 'next/navigation';
import styles from './ActionButton.module.sass';

export default function ActionButton({
  text,
  href,
  onClick,
  variant = 'default',
  className = '',
  showArrow = false,
}) {
  const router = useRouter();

  const handleClick = (e) => {
    onClick?.(e);

    if (href) {
      router.push(href);
    }
  };

  return (
    <button
      type="button"
      className={`${styles.action_button} ${styles[variant]} ${className}`}
      onClick={handleClick}
    >
      <span>{text}</span>

      {showArrow && (
        <span className="material-symbols-rounded">
          arrow_forward
        </span>
      )}
    </button>
  );
}