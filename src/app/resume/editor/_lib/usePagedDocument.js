'use client';

import { useEffect, useRef, useState } from 'react';

import { planPages } from '@/app/resume/editor/_lib/pageBreaks';

// 편집기와 같은 자리에서 장이 나뉘도록 빈 자리를 끼워 넣는다
export default function usePagedDocument(html) {
  const ref = useRef(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const paper = ref.current;
    if (!paper) return undefined;

    const relayout = () => {
      paper.querySelectorAll('[data-page-spacer]').forEach((node) => node.remove());

      const blocks = [...paper.children];
      const { breaks, count } = planPages(paper);

      breaks.forEach((item) => {
        const spacer = document.createElement('div');
        spacer.dataset.pageSpacer = 'true';
        spacer.style.height = `${item.height}px`;
        blocks[item.index]?.before(spacer);
      });

      setPageCount(count);
    };

    relayout();

    // 그림이 늦게 뜨면 높이가 바뀐다
    paper.addEventListener('load', relayout, true);
    window.addEventListener('resize', relayout);

    return () => {
      paper.removeEventListener('load', relayout, true);
      window.removeEventListener('resize', relayout);
    };
  }, [html]);

  return { ref, pageCount };
}
