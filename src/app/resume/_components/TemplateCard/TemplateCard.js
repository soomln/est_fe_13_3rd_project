'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { getTemplate, toggleTemplateBookmark } from '@backend/lib/api/templates';
import { useAuth } from '@/app/_components/auth';
import BookmarkBtn from '@/app/_components/common/BookmarkBtn';
import PrimaryBtn from '@/app/resume/_components/PrimaryBtn';
import styles from './TemplateCard.module.sass';

// 편집기 A4 종이 폭. DocumentPage.module.sass 와 같은 값이어야 한다
const PAPER_WIDTH = 794;

export default function TemplateCard({ id, type, title, views, isBookmarked = false, onBookmark }) {
  const { isLoggedIn, openLogin } = useAuth();
  const [saved, setSaved] = useState(isBookmarked);
  const [preview, setPreview] = useState('');

  // 미리보기는 편집기에서 열리는 양식 그대로를 줄여서 보여준다
  useEffect(() => {
    let alive = true;

    getTemplate(id)
      .then((doc) => {
        if (alive) setPreview(doc?.contentHtml ?? '');
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, [id]);

  // 편집기 문서(794px)를 카드 폭에 딱 맞춘다. 아래로 넘치는 부분은 잘린다
  const thumbRef = useRef(null);
  const docRef = useRef(null);

  useEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb) return undefined;

    const fit = () => {
      if (docRef.current) docRef.current.style.zoom = thumb.clientWidth / PAPER_WIDTH;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(thumb);

    return () => observer.disconnect();
  }, [preview]);

  // 서버 응답을 기다리지 않고 먼저 켠다. 실패하면 되돌린다
  const toggle = async () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    const next = !saved;
    setSaved(next);

    try {
      await toggleTemplateBookmark(id);
      if (onBookmark) onBookmark(id, next);
    } catch {
      setSaved(!next);
    }
  };

  return (
    <li className={styles.template_card}>
      <Link href={`/resume/editor?template=${id}`} className={styles.template_card_link}>
        <div className={styles.template_card_top}>
          <div className={styles.template_card_thumb} ref={thumbRef}>
            <div className={styles.template_card_paper}>
              <div
                ref={docRef}
                className={styles.template_card_doc}
                aria-hidden='true'
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>
          </div>

          <div className={styles.template_card_overlay}>
            <PrimaryBtn as='span' label='작성하기' />
          </div>
        </div>

        <div className={styles.template_card_info}>
          <div className={styles.template_card_text}>
            <p className={`${styles.template_card_type} font_caption_b`}>{type}</p>
            <p className={`${styles.template_card_title} font_body_l_b`}>{title}</p>
          </div>
          <span
            className={`${styles.template_card_views} font_caption_b`}
            aria-label={`조회수 ${views.toLocaleString()}`}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              visibility
            </span>
            {views.toLocaleString()}
          </span>
        </div>
      </Link>

      <div className={styles.template_card_bookmark}>
        <BookmarkBtn isActive={saved} onClick={toggle} />
      </div>
    </li>
  );
}
