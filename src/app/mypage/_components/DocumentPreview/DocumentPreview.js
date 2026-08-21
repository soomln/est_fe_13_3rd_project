'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import { getDocument } from '@backend/lib/api/documents';
import useDialog from '@/app/mypage/_lib/useDialog';
import formatDate from '@/app/mypage/_lib/formatDate';
import FONT_VARS from '@/app/resume/editor/_lib/editorFonts';
import usePagedDocument from '@/app/resume/editor/_lib/usePagedDocument';
import styles from './DocumentPreview.module.sass';

const TYPE_LABEL = { resume: '이력서', cover_letter: '자기소개서' };

// id 를 넘기면 열린다
export default function DocumentPreview({ id, onClose }) {
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!id) return undefined;

    let alive = true;
    setStatus('loading');
    setDoc(null);

    getDocument(id)
      .then((result) => {
        if (!alive) return;
        setDoc(result);
        setStatus('ready');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, [id]);

  useDialog(Boolean(id), onClose);

  // 편집기와 같은 자리에서 장이 나뉘게 한다
  const { ref: paperRef, pageCount } = usePagedDocument(doc?.contentHtml);

  if (!id) return null;

  const tone = doc?.docType === 'cover_letter' ? 'amber' : 'green';

  return (
    <div
      className={styles.document_preview_overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.document_preview} role='dialog' aria-modal='true' aria-label='문서 미리보기'>
        <div className={styles.document_preview_head}>
          <div className={styles.document_preview_head_text}>
            {doc && (
              <span className={`${styles[`document_preview_tag_${tone}`]} font_body_s_b`}>
                {TYPE_LABEL[doc.docType]}
              </span>
            )}
            <p className={`${styles.document_preview_title} font_h4`}>
              {doc ? doc.title : '미리보기'}
            </p>
            {doc && (
              <span className={`${styles.document_preview_date} font_body_s_b`}>
                {formatDate(doc.updatedAt)}
              </span>
            )}
          </div>

          <button
            type='button'
            className={styles.document_preview_close}
            onClick={onClose}
            aria-label='닫기'
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              close
            </span>
          </button>
        </div>

        <div className={styles.document_preview_body}>
          {status === 'loading' && (
            <p className={`${styles.document_preview_state} font_body_m_r`} role='status'>
              불러오는 중이에요…
            </p>
          )}

          {status === 'error' && (
            <p className={`${styles.document_preview_state} font_body_m_r`} role='status'>
              문서를 불러오지 못했어요.
            </p>
          )}

          {status === 'ready' &&
            (doc.contentHtml ? (
              <div className={styles.document_preview_stack}>
                <div className={styles.document_preview_sheets} aria-hidden='true'>
                  {Array.from({ length: pageCount }, (_, index) => (
                    <div key={index} className={styles.document_preview_sheet} />
                  ))}
                </div>

                <article
                  ref={paperRef}
                  className={`${styles.document_preview_paper} ${FONT_VARS}`}
                  dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
                />
              </div>
            ) : (
              <p className={`${styles.document_preview_state} font_body_m_r`}>
                아직 작성한 내용이 없어요.
              </p>
            ))}
        </div>

        <div className={styles.document_preview_foot}>
          <Link
            href={`/resume/editor?document=${id}`}
            className={`${styles.document_preview_edit_btn} font_body_l_b`}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              edit
            </span>
            편집하기
          </Link>

          <button
            type='button'
            className={`${styles.document_preview_ghost_btn} font_body_l_b`}
            onClick={onClose}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
