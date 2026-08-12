import './AiChatBubble.sass';

export default function AiChatBubble({ message }) {
  return (
    <div className="ai_chat_bubble">
      <div className="ai_profile">
        <img
          src="/images/ai-interviewer.png"
          alt="AI 면접관"
        />
      </div>

      <div className="message_content">
        <span className="ai_name font_body_l_b">
          AI 면접관
        </span>

        <div className="message_row">
          <div className="message_bubble font_body_l_r">
            <p>
              {message ||
                '안녕하세요! 저는 AI 면접관입니다. 면접 진행을 위해 우측 패널 옵션을 선택해주세요!'}
            </p>
          </div>

          <span className="message_time font_caption_r">
            01:43
          </span>
        </div>
      </div>
    </div>
  );
}