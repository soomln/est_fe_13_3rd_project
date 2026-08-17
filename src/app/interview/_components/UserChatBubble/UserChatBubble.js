import styles from './UserChatBubble.module.sass';

export default function UserChatBubble({
  message,
  time,
}) {
  return (
    <div className={styles.user_chat}>
      <span className={`${styles.user_name} font_body_m_b`}>
        나
      </span>

      <div className={styles.message_wrap}>
        <span className={`${styles.time} font_caption_r`}>
          {time}
        </span>

        <div className={styles.bubble}>
          <p className="font_body_l_r">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}