'use client';

import { useState } from 'react';

import './ActionButton.sass';

export default function ActionButton({
  text,
  onClick,
}) {
  const [isActive, setIsActive] = useState(false);

  const handleClick = (e) => {
    setIsActive((prev) => !prev);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      className={`action_button font_h4${isActive ? ' is_active' : ''}`}
      onClick={handleClick}
    >
      <span>{text}</span>
      <span className="material-symbols-outlined">
        arrow_forward
      </span>
    </button>
  );
}