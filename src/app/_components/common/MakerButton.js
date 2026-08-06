import Image from 'next/image';
import styles from './MakerButton.module.sass';

// 폰트 매핑 추가
const FONT_SIZE_MAP = {
  large: 'font_body_m_b',
  medium: 'font_body_s_r',
  small: 'font_caption_r',
};

export default function MakerButton({
  src = '/assets/images/default_profile.png',
  name = '',
  size = 'medium',
  onClick = () => {},
}) {
  return (
    <button type='button' className={`${styles.maker_btn} ${styles[size]}`} onClick={onClick}>
      <div className={styles.avatar_wrapper}>
        <Image
          src={src}
          alt={`${name} 프로필`}
          fill
          sizes='(max-width: 768px) 100vw, 80px'
          className={styles.avatar_img}
        />
      </div>
      {/* 폰트 수정 */}
      {name && <span className={`${styles.name} ${FONT_SIZE_MAP[size]}`}>{name}</span>}
    </button>
  );
}
