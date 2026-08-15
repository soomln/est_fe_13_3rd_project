import Image from 'next/image';

import ActionBtn from '../ActionBtn';

import { togglePortfolioLike, togglePortfolioBookmark } from '@backend/lib/api/portfolio';

import styles from './PortfolioCard.module.sass';

export default function PortfolioCard({ item, onClick, isSelected = false, onToggle, updateReactionCount }) {
  return (
    <li
      className={`${styles.portfolio_card}`}
      onClick={() => {
        onClick(item);
      }}
    >
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

      {/* 썸네일 & 제목 영역 */}
      <div className={styles.thumb_box}>
        {item.thumbnailUrl ? (
          <Image src={item.thumbnailUrl} fill alt={item.title || '포트폴리오 썸네일'} className={styles.thumb_img} />
        ) : (
          <div className={`font_h2 ${styles.thumb_dummy}`}>NULL</div>
        )}
        <div className={styles.img_hover}>
          <div className={styles.label}>
            <span>{item.category}</span>
            <h4 className='font_h4'>{item.title}</h4>
          </div>
          <p className='font_body_r_b'>{item.description}</p>
        </div>
      </div>

      {/* 카드 하단 정보 영역 */}
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
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ActionBtn
            iconText='thumb_up_alt'
            count={item.likeCount}
            onClick={async (isActive) => {
              await togglePortfolioLike(item.id);

              updateReactionCount(item.id, 'likeCount', isActive ? -1 : 1);
            }}
          />
          <ActionBtn
            iconText='bookmark'
            count={item.bookmarkCount}
            onClick={async (isActive) => {
              await togglePortfolioBookmark(item.id);

              updateReactionCount(item.id, 'bookmarkCount', isActive ? -1 : 1);
            }}
          />
        </div>
      </div>
    </li>
  );
}
