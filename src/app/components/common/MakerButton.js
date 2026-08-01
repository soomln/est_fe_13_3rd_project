import Image from 'next/image';
import styles from './MakerButton.module.sass';

/**
 * [공통] 메이커 프로필 버튼 컴포넌트
 *
 * @param {string} src - 프로필 이미지 경로
 * @param {string} name - 메이커/작성자 이름 (예: 'Zero Margin')
 * @param {string} size - 크기 옵션 ('large' | 'medium' | 'small')
 * @param {Function} onClick - 클릭 이벤트 핸들러
 */
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
      {name && <span className={styles.name}>{name}</span>}
    </button>
  );
}
