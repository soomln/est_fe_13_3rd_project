import styles from './Bubble.module.sass';

// AI · 사용자 말풍선
export default function Bubble({ role, children }) {
  const isAi = role === 'ai';

  return (
    <div className={`${styles.bubble} ${isAi ? styles.bubble_ai : styles.bubble_user}`}>
      {isAi ? (
        <span className={styles.bubble_avatar}>
          <img src='/images/resume/ai_profile.png' alt='' className={styles.bubble_avatar_img} />
        </span>
      ) : null}

      <div className={`${styles.bubble_box} font_body_m_r`}>{children}</div>

      {isAi ? null : (
        <span className={`${styles.bubble_avatar_user} font_body_m_b`} aria-hidden='true'>
          나
        </span>
      )}
    </div>
  );
}
