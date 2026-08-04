import { useState } from 'react';
import styles from './SortBtn.module.sass';

export default function SortBtn({ onClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [option, setOption] = useState('최신순');

  const onClickOption = (e) => {
    // onClick();
    setOption(e.target.textContent);
    setIsOpen((prev) => !prev);
  };
  return (
    <>
      <button
        className={`${styles.sort_btn} ${isOpen ? styles.active : ''} w-[110px] font_body_m_b flex items-center px-[14px] py-[6px] rounded-full cursor-pointer`}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        {option}
        <span className={`material-symbols-sharp`}>arrow_drop_down</span>
      </button>
      <ul
        className={`${styles.option_list} w-[110px] rounded-lg absolute z-[100] translate-y-[8px] ${isOpen ? 'is_open flex flex-col' : 'hidden'}`}
      >
        <li
          className={`${styles.option} font_body_m_b flex items-center rounded-full cursor-pointer`}
          onClick={onClickOption}
        >
          최신순
        </li>
        <li
          className={`${styles.option} font_body_m_b flex items-center rounded-full cursor-pointer`}
          onClick={onClickOption}
        >
          인기순
        </li>
        <li
          className={`${styles.option} font_body_m_b flex items-center rounded-full cursor-pointer`}
          onClick={onClickOption}
        >
          스크랩순
        </li>
      </ul>
    </>
  );
}
