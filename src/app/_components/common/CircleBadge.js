import Image from 'next/image';
import styles from './CircleBadge.module.sass';

// size 옵션별 전역 폰트 클래스 매핑
const FONT_SIZE_MAP = {
  large: 'font_body_m_b',
  medium: 'font_body_s_r',
  small: 'font_caption_r',
};

export default function CircleBadge({ src, name, size, textColor = '#6F6F6F', onClick }) {
  return (
    <button type='button' className={`${styles.circle_badge} ${styles[size]}`} onClick={onClick}>
      <div className={styles.avatar_wrapper}>
        <Image
          src={src}
          alt={`${name} 프로필`}
          fill
          sizes='(max-width: 768px) 100vw, 80px'
          className={styles.avatar_img}
        />
      </div>
      {/* 폰트 수정: FONT_SIZE_MAP이 실제 화면에 적용되도록 연결 */}
      {name && (
        <span className={`${styles.name} ${FONT_SIZE_MAP[size]}`} style={{ color: textColor }}>
          {name}
        </span>
      )}
    </button>
  );
}
