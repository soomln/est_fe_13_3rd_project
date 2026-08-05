import Image from 'next/image';
import styles from './MakerButton.module.sass';

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
          sizes='(max-width: 768px) 100vw, 70px'
          className={styles.avatar_img}
        />
      </div>
      {name && <span className={styles.name}>{name}</span>}
    </button>
  );
}
