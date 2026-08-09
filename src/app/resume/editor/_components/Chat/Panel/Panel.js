'use client';

import Bubble from '@/app/resume/editor/_components/Chat/Bubble';
import ChatInput from '@/app/resume/editor/_components/Chat/Input';
import styles from './Panel.module.sass';

export default function Panel({ isOpen, onClose }) {
  return (
    <aside
      className={`${styles.chat_panel} ${isOpen ? '' : styles.chat_panel_closed}`}
      aria-hidden={!isOpen}
    >
      <div className={styles.chat_panel_inner}>
        <div className={styles.chat_panel_head}>
          <div className={styles.chat_panel_profile}>
            <span className={styles.chat_panel_avatar}>
              <img
                src='/images/resume/ai_profile.png'
                alt=''
                className={styles.chat_panel_avatar_img}
              />
            </span>

            <span className={styles.chat_panel_names}>
              <span className={`${styles.chat_panel_name} font_h4`}>CallBack AI 코치</span>
              <span className={`${styles.chat_panel_state} font_body_m_b`}>무엇이든 물어보세요</span>
            </span>
          </div>

          <button
            type='button'
            className={styles.chat_panel_collapse}
            onClick={onClose}
            aria-label='AI 코치 접기'
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              keyboard_double_arrow_left
            </span>
          </button>
        </div>

        <div className={styles.chat_panel_view}>
          {/* 주의: Alan AI 연결 전까지 쓰는 임시 대화 */}
          <div className={styles.chat_panel_list}>
            <div className={styles.chat_panel_turn}>
              <Bubble role='ai'>
                안녕하세요.
                <br />
                작성을 도와드릴 AI 코치입니다.
                <br />
                <br />
                작성 시작 전 마이페이지에 등록된 정보를 바탕으로 자동 기입해드릴까요? 🙂
              </Bubble>

              <div className={styles.chat_panel_tags}>
                <button type='button' className={`${styles.chat_panel_tag} font_body_s_b`}>
                  내 정보 불러오기
                </button>
                <button type='button' className={`${styles.chat_panel_tag} font_body_s_b`}>
                  직접 작성하기
                </button>
              </div>
            </div>

            <Bubble role='user'>내가 언제 졸업했는지 모르겠어.</Bubble>

            <Bubble role='ai'>
              🔎 정부24에서 확인하실 수 있어요.
              <br />
              <br />
              www.gov.kr에 로그인하신 뒤,
              <br />
              ‘졸업(예정) 증명서’ 발급 메뉴에서 정확한 졸업 연월을 확인하실 수 있습니다.
              <br />
              <br />
              확인 후 직접 작성하거나 저에게 알려주시면 이력서에 자동으로 채워드릴게요.
            </Bubble>
          </div>
        </div>

        <div className={styles.chat_panel_foot}>
          <ChatInput />
        </div>
      </div>
    </aside>
  );
}
