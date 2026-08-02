import styles from './PortfolioCard.module.sass';

/**
 * [공통] 포트폴리오 카드 컴포넌트
 *
 * @param {string} thumbnailUrl
 * @param {string} title
 * @param {string} authorName
 * @param {string} authorAvatar
 * @param {number} likeCount
 * @param {number} bookmarkCount
 * @param {Function} onClick
 */
export default function PortfolioCard({
  thumbnailUrl = '',
  title = '',
  authorName = '이름',
  authorAvatar = '',
  likeCount = 50,
  bookmarkCount = 50,
  onClick = () => {},
}) {
  return (
    <div className={styles.portfolio_card} onClick={onClick}>
      {/* 썸네일 & 제목 영역 */}
      <div className={styles.thumb_box}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title || '포트폴리오 썸네일'} className={styles.thumb_img} />
        ) : (
          <div className={styles.thumb_dummy} />
        )}

        {title && <p className={styles.card_title}>{title}</p>}
      </div>

      {/* 카드 하단 정보 영역 */}
      <div className={styles.info_box}>
        <div className={styles.author_info}>
          {authorAvatar ? (
            <img src={authorAvatar} alt={authorName} className={styles.avatar_img} />
          ) : (
            <span className={styles.avatar_dummy} />
          )}
          <span className={styles.author_name}>{authorName}</span>
        </div>

        <div className={styles.stats_info}>
          <div className={styles.stat_item}>
            <span className='material-symbols-sharp'>thumb_up</span>
            <span className={styles.count}>{likeCount}</span>
          </div>
          <div className={styles.stat_item}>
            <span className='material-symbols-sharp'>bookmark</span>
            <span className={styles.count}>{bookmarkCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
