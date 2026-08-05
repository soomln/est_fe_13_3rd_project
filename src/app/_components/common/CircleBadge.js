import Image from 'next/image';
import styles from './CircleBadge.module.sass';

export default function CircleBadge({
  src,
  name,
  size = 'medium',
  onClick = () => {},
  onHover = () => {},
}) {
  return (
    <button
      type='button'
      className={`${styles.circle_badge} ${styles[size]}`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHover}
    >
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
