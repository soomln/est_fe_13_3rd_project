'use client';

import styles from './Pagination.module.sass';

export default function Pagination({ currentPage, totalPages, onPageChange, maxPageButtons }) {
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
      <button className={styles.btnArrow} onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        &lt;
      </button>

      {getPageNumbers().map((page, index) => {
        if (typeof page === 'string') {
          return (
            <span key={`ellipsis-${index}`} className={styles.ellipsis}>
              ...
            </span>
          );
        }

        const isActive = page === currentPage;

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${styles.btnPage} ${isActive ? styles.active : ''}`}
          >
            {page}
          </button>
        );
      })}

      <button
        className={styles.btnArrow}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &gt;
      </button>
    </nav>
  );
}
