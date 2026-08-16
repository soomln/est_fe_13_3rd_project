import Image from 'next/image';
import './AiChatBubble.sass';

export default function AiChatBubble({ message }) {
  const displayMessage =
    message ||
    '안녕하세요!\n저는 AI 면접관입니다.\n\n면접 진행을 위해\n우측 패널의 옵션을 선택해주세요.';

  return (
    <div className="ai_chat_bubble">
      <div className="ai_profile">
        <Image
          src="/images/ai-interviewer.png"
          alt="AI 면접관"
          width={80}
          height={80}
        />
      </div>

      <div className="message_content">
        <span className="ai_name font_body_l_b">
          AI 면접관
        </span>

        <div className="message_row">
          <div className="message_bubble font_body_l_r">
            <p className="message_text">
              {displayMessage}
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