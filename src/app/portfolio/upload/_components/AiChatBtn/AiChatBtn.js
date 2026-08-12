import styles from './AiChatBtn.module.sass';

export default function AiChatBtn({ onClick }) {
  return (
    <button type='button' className={styles.ai_btn} onClick={onClick} aria-label='AI 채팅 열기'>
      <span className='material-symbols-sharp'>auto_awesome</span>
      <span className='font_body_m_b'>AI 채팅</span>
    </button>
  );
}
