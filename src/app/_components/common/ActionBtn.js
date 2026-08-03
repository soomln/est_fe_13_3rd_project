import { useState } from 'react';
import style from './ActionBtn.sass';

export default function LikeBtn({ iconText, count, onClick }) {
  const [isSelected, setIsSelected] = useState(false);
  return (
    <button
      className='action_btn'
      onClick={() => {
        setIsSelected(!isSelected);
        // onClick();
      }}
    >
      <span className={`icon material-symbols-rounded ${isSelected ? 'active' : ''}`}>{iconText}</span>
      <span className='count font_body_m_b'>{count}</span>
    </button>
  );
}
