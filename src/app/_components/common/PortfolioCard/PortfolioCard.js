import Image from 'next/image';

import ActionBtn from '../ActionBtn';

import { togglePortfolioLike, togglePortfolioBookmark } from '@backend/lib/api/portfolio';

import styles from './PortfolioCard.module.sass';

export default function PortfolioCard({
  item,
  onClick,
  isSelected = false,
  onToggle,
  updateReaction,
  imageSizes = '100vw',
  isLcpImage = false,
  titleTag: TitleTag = 'h4',
}) {
  const handleLike = async () => {
    const active = await togglePortfolioLike(item.id);

    updateReaction(item.id, 'like', active);
  };

  const handleBookmark = async () => {
    const active = await togglePortfolioBookmark(item.id);

    updateReaction(item.id, 'bookmark', active);
  };

  return (
    <div className={styles.portfolio_card} onClick={() => onClick(item)}>
      {onToggle && (
        <label
          className={styles.select_box}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <input type='checkbox' checked={isSelected} onChange={onToggle} aria-label={`${item.title} 선택`} />

          <span className='material-symbols-sharp' aria-hidden='true'>
            check
          </span>
        </label>
      )}

      <div className={styles.thumb_box}>
        {item.thumbnailUrl ? (
          <Image
            src={item.thumbnailUrl}
            fill
            sizes={imageSizes}
            loading={isLcpImage ? 'eager' : undefined}
            fetchPriority={isLcpImage ? 'high' : undefined}
            alt={item.title || '포트폴리오 썸네일'}
            className={styles.thumb_img}
          />
        ) : (
          <div className={`font_h2 ${styles.thumb_dummy}`}>NULL</div>
        )}

        <div className={styles.img_hover}>
          <div className={styles.label}>
            <span>{item.category}</span>

            <TitleTag className={`font_h4 ${styles.title}`}>{item.title}</TitleTag>
          </div>

          <p className='font_body_r_b'>{item.description}</p>
        </div>
      </div>

      <div className={styles.info_box}>
        <div className={styles.author_info}>
          {item.authorAvatar ? (
            <img src={item.authorAvatar} alt={item.authorName} className={styles.avatar_img} />
          ) : (
            <span className={styles.avatar_dummy} />
          )}

          <span className={`${styles.author_name} font_body_s_b`}>{item.authorName}</span>
        </div>

        <div
          className={styles.actions}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <ActionBtn iconText='thumb_up' count={item.likeCount} isActive={item.isLiked} onClick={handleLike} />

          <ActionBtn
            iconText='bookmark'
            count={item.bookmarkCount}
            isActive={item.isBookmarked}
            onClick={handleBookmark}
          />
        </div>
      </div>
    </div>
  );
}
