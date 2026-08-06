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
        className={`${styles.sort_btn} ${isOpen ? styles.active : ''} font_body_m_b`}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        {option}
        <span className={`material-symbols-sharp`}>arrow_drop_down</span>
      </button>
      <ul className={`${styles.option_list} ${isOpen ? styles.is_open : ''}`}>
        <li className={`${styles.option} font_body_m_b`} onClick={onClickOption}>
          최신순
        </li>
        <li className={`${styles.option} font_body_m_b`} onClick={onClickOption}>
          인기순
        </li>
        <li className={`${styles.option} font_body_m_b`} onClick={onClickOption}>
          스크랩순
        </li>
      </ul>
    </>
  );
}
