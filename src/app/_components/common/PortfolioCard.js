import styles from './PortfolioCard.module.sass';
import ActionBtn from './ActionBtn';
export default function PortfolioCard({ item, onClick = () => {} }) {
  return (
    <li className={styles.portfolio_card} onClick={onClick}>
      {/* 썸네일 & 제목 영역 */}
      <div className={styles.thumb_box}>
        {item.thumbnailUrl !== '' ? (
          <img src={item.thumbnailUrl} alt={item.title || '포트폴리오 썸네일'} className={styles.thumb_img} />
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
            <img src={authorAvatar} alt={item.authorName} className={styles.avatar_img} />
          ) : (
            <span className={styles.avatar_dummy} />
          )}
          <span className={`${styles.author_name} font_body_s_b`}>{item.authorName}</span>
        </div>

        <div className={styles.actions}>
          <ActionBtn iconText={'thumb_up_alt'} count={50} />
          <ActionBtn iconText={'bookmark'} count={50} />
        </div>
      </div>
    </li>
  );
}
