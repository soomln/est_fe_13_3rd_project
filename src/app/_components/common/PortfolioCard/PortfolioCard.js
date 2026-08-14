import Image from 'next/image';

import ActionBtn from '../ActionBtn';

import styles from './PortfolioCard.module.sass';

// onToggle 을 넘길 때만 선택용 체크박스가 나온다 (마이페이지 삭제모드)
export default function PortfolioCard({ item, onClick, isSelected = false, onToggle }) {
  return (
    <li
      className={`${styles.portfolio_card} ${isSelected ? styles.is_selected : ''}`}
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
        {item.thumbnailUrl !== '' ? (
          <Image src={item.thumbnailUrl} fill alt={item.title || '포트폴리오 썸네일'} className={styles.thumb_img} />
        ) : (
          <div className={styles.thumb_dummy} />
        )}
        <div className={styles.img_hover}>
          <h4 className='font_h4'>{item.title}</h4>
        </div>{' '}
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
          <ActionBtn iconText={'thumb_up_alt'} count={item.likeCount} />
          <ActionBtn iconText={'bookmark'} count={item.bookmarkCount} />
        </div>
      </div>
    </li>
  );
}
