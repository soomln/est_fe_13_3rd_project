import styles from './AiToolMenu.module.sass';

const AI_TOOLS = [
  { icon: 'auto_fix_high', label: '첨삭' },
  { icon: 'tag', label: '키워드 추천' },
  { icon: 'edit_note', label: '문장 개선' },
  { icon: 'translate', label: '번역', children: ['영어', '일본어', '중국어'] },
  { icon: 'mic', label: '톤 수정', children: ['정중하게', '친근하게', '간결하게', '전문적으로'] },
];

// 호버하면 열리는 AI 보조도구 메뉴
export default function AiToolMenu() {
  return (
    <div className={styles.ai_tool}>
      <button type='button' className={styles.ai_tool_btn} aria-label='AI 보조도구'>
        <span className='material-symbols-sharp' aria-hidden='true'>
          auto_fix_high
        </span>
      </button>

      <div className={styles.ai_tool_menu}>
        <p className={`${styles.ai_tool_menu_title} font_body_m_r`}>AI 보조도구</p>

        <ul>
          {AI_TOOLS.map((tool) => (
            <li key={tool.label} className={styles.ai_tool_item}>
              <button type='button' className={`${styles.ai_tool_option} font_body_l_r`}>
                <span className={styles.ai_tool_option_text}>
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    {tool.icon}
                  </span>
                  {tool.label}
                </span>

                {tool.children && (
                  <span className='material-symbols-sharp' aria-hidden='true'>
                    keyboard_arrow_right
                  </span>
                )}
              </button>

              {tool.children && (
                <ul className={styles.ai_tool_submenu}>
                  {tool.children.map((child) => (
                    <li key={child}>
                      <button type='button' className={`${styles.ai_tool_option} font_body_l_r`}>
                        <span className={styles.ai_tool_option_text}>{child}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
