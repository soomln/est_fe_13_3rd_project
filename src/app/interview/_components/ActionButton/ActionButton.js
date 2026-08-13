'use client';

import { useRouter } from 'next/navigation';
import './ActionButton.sass';

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
      className={`action_button ${variant} ${className}`}
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