import { useState } from 'react';
import styles from './SortBtn.module.sass';

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'bookmarks', label: '스크랩순' },
];

export default function SortBtn({ selectedSort, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = sortOptions.find((option) => option.value === selectedSort)?.label || '최신순';

  const onClickOption = (value) => {
    onChange(value);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type='button'
        className={`${styles.sort_btn} ${isOpen ? styles.active : ''} font_body_m_b`}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
      >
        {selectedLabel}
        <span className='material-symbols-sharp'>arrow_drop_down</span>
      </button>

      <ul className={`${styles.option_list} ${isOpen ? styles.is_open : ''}`}>
        {sortOptions.map((option) => (
          <li
            key={option.value}
            className={`${styles.option} font_body_m_b`}
            onClick={() => {
              onClickOption(option.value);
            }}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </>
  );
}
