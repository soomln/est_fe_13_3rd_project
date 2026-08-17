import Link from 'next/link';

import styles from './PostDetailHeader.module.sass';

// 후기 / 족보 상세 상단 (목록으로 · 라벨 · 제목 · 메타 · 카운트)
export default function PostDetailHeader({ label, post, backHref, showTitle = true, isMine, onDeleteClick }) {
  const metaItems = [
    { label: '면접 난이도', value: post.difficulty, isPoint: true },
    { label: '합격 여부', value: post.result },
    { label: '면접 경로', value: post.route },
  ];

  return (
    <header className={styles.head}>
      {backHref && (
        <Link className={`${styles.head_back} font_body_s_r`} href={backHref}>
          <span className='material-symbols-rounded' aria-hidden='true'>
            chevron_left
          </span>
          목록으로
        </Link>
      )}

      {(label || showTitle) && (
        <div className={styles.head_top}>
          {label && <p className={`${styles.head_label} font_body_l_b`}>{label}</p>}
          {showTitle && <h1 className={`${styles.head_title} font_h1`}>{post.title}</h1>}
        </div>
      )}

      <div className={styles.head_meta}>
        <div className={styles.head_tags}>
          {metaItems.map((item) => (
            <div key={item.label} className={styles.head_tag}>
              <span className='font_body_l_b'>{item.label}</span>
              <span
                className={`${styles.head_value} ${item.isPoint ? styles.head_value_point : ''} font_body_l_r`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className={styles.head_writer}>
          <span className={`material-symbols-rounded ${styles.head_writer_icon}`} aria-hidden='true'>
            account_circle
          </span>

          <span className='font_body_l_r'>{post.jobInfo || post.authorName}</span>
          <span className={`${styles.head_date} font_body_l_r`}>{post.date}</span>

          {isMine && (
            <button type='button' className={`${styles.head_delete} font_body_l_r`} onClick={onDeleteClick}>
              삭제
            </button>
          )}
        </div>
      </div>

      <div className={`${styles.head_counts} font_body_l_r`}>
        <span className={styles.head_scrap}>
          <span className={`material-symbols-sharp ${styles.head_scrap_icon}`} aria-hidden='true'>
            bookmark
          </span>
          퍼가요 {post.saveCount}
        </span>

        <span>댓글 {post.commentCount}</span>
      </div>
    </header>
  );
}
