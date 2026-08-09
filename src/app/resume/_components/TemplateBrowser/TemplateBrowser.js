'use client';

import { useState } from 'react';
import Link from 'next/link';

import CategoryBtn from '@/app/resume/_components/CategoryBtn';
import TemplateCard from '@/app/resume/_components/TemplateCard';
import styles from './TemplateBrowser.module.sass';

const ALL_CATEGORY = '전체';
const CATEGORIES = [ALL_CATEGORY, '이력서', '자기소개서'];
const PAGE_SIZE = 3;

export default function TemplateBrowser({ items }) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [page, setPage] = useState(0);

  const visibleItems =
    selectedCategory === ALL_CATEGORY ? items : items.filter((item) => item.type === selectedCategory);

  const pageCount = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE));
  const pageItems = visibleItems.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const countOf = (category) =>
    category === ALL_CATEGORY ? items.length : items.filter((item) => item.type === category).length;

  const selectCategory = (category) => {
    setSelectedCategory(category);
    setPage(0);
  };

  return (
    <div className={styles.template_browser}>
      <div className={styles.template_browser_filter}>
        <div className={styles.template_browser_chips}>
          {CATEGORIES.map((category) => (
            <CategoryBtn
              key={category}
              label={category}
              count={countOf(category)}
              isActive={selectedCategory === category}
              onClick={() => selectCategory(category)}
            />
          ))}
        </div>

        <Link href='/resume/free_form' className={`${styles.template_browser_more} font_body_s_b`}>
          더보기
          <span className='material-symbols-sharp' aria-hidden='true'>
            arrow_forward
          </span>
        </Link>
      </div>

      <div className={styles.template_browser_carousel}>
        <button
          type='button'
          className={styles.template_browser_arrow}
          onClick={() => setPage((prev) => prev - 1)}
          disabled={page === 0}
          aria-label='이전 양식 보기'
        >
          <span className='material-symbols-sharp' aria-hidden='true'>
            keyboard_arrow_left
          </span>
        </button>

        <ul className={styles.template_browser_track}>
          {pageItems.map((item) => (
            <TemplateCard
              key={item.id}
              id={item.id}
              type={item.type}
              title={item.title}
              views={item.views}
              thumbnailUrl={item.thumbnailUrl}
            />
          ))}
        </ul>

        <button
          type='button'
          className={styles.template_browser_arrow}
          onClick={() => setPage((prev) => prev + 1)}
          disabled={page >= pageCount - 1}
          aria-label='다음 양식 보기'
        >
          <span className='material-symbols-sharp' aria-hidden='true'>
            keyboard_arrow_right
          </span>
        </button>
      </div>
    </div>
  );
}
