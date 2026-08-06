import './AiChatBubble.sass';

export default function AiChatBubble() {
  return (
    <div className="ai_chat">
      <Image
        src="#"
        alt="AI 면접관"
        width={80}
        height={100}
      />

      <div className="chat_content">
        <span className="name font_body_m_b">AI 면접관</span>

        <div className="message_wrap">
          <div className="bubble">
            <p className="font_body_l_r">
              안녕하세요! 저는 AI 면접관입니다.
              <br />
              지금부터 프론트엔드 개발자 포지션에 대한 면접을 진행하겠습니다.
              <br />
              준비가 되셨다면 자기소개 부탁드릴게요.
            </p>
          </div>

          <span className="time font_caption_r">01:43</span>
        </div>
      </div>
    </div>
  );
}