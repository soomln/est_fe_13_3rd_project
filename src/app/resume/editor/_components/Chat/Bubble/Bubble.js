import styles from './Bubble.module.sass';

const AI_AVATAR = '/images/resume/ai_profile.png';

// AI · 사용자 말풍선
export default function Bubble({ role, avatarUrl, children }) {
  const isAi = role === 'ai';
  const src = isAi ? AI_AVATAR : avatarUrl;

  return (
    <div className={`${styles.bubble} ${isAi ? styles.bubble_ai : styles.bubble_user}`}>
      {isAi ? (
        <span className={styles.bubble_avatar}>
          <img src={src} alt='' className={styles.bubble_avatar_img} />
        </span>
      ) : null}

      <div className={`${styles.bubble_box} font_body_m_r`}>{children}</div>

      {isAi ? null : (
        <span className={styles.bubble_avatar_user}>
          {src ? (
            <img src={src} alt='' className={styles.bubble_avatar_img} />
          ) : (
            <span className='material-symbols-sharp' aria-hidden='true'>
              person
            </span>
          )}
        </span>
      )}
    </div>
  );
}
