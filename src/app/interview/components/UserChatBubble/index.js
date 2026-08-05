import './UserChatBubble.sass';

export default function UserChatBubble({
  message,
  time,
}) {
  return (
    <div className="user_chat">
      <span className="user_name font_body_m_b">
        나
      </span>

      <div className="message_wrap">
        <span className="time font_caption_r">
          {time}
        </span>

        <div className="bubble">
          <p className="font_body_l_r">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}