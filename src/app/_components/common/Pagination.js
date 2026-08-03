'use client';

import styles from './Pagination.module.sass';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange = () => {}, maxPageButtons = 5 }) {
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav className={styles.pagination}>
      <button
        className={`${styles.btn_arrow} font_body_m_r`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &lt;
      </button>

      {getPageNumbers().map((page, index) => {
        if (typeof page === 'string') {
          return (
            <span key={`ellipsis-${index}`} className={`${styles.ellipsis} font_body_m_r`}>
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${styles.btn_page} ${isActive ? styles.is_active : ''} ${isActive ? 'font_body_m_b' : 'font_body_m_r'}`.trim()}
          >
            {page}
          </button>
        );
      })}

      <button
        className={`${styles.btn_arrow} font_body_m_r`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </nav>
  );
}
