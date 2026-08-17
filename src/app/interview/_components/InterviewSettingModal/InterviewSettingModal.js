'use client';

import styles from './InterviewSettingModal.module.sass';

export default function InterviewSettingModal({
  onClose,
  showTimer,
  onToggleShowTimer,
  interviewerStyle,
  onInterviewerStyleChange,
}) {
  return (
    <div className={styles.modal_overlay}>
      <div className={styles.setting_modal}>
        <div className={styles.modal_header}>
          <div className={styles.modal_title}>
            <span className={`material-symbols-outlined ${styles.setting_icon}`}>
              settings
            </span>

            <h2 className="font_h3">면접 설정</h2>
          </div>

          <button
            type="button"
            className={styles.close_button}
            onClick={onClose}
            aria-label="면접 설정 닫기"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>

        <section className={styles.setting_section}>
          <h3 className="font_h4">기본 설정</h3>

          <div className={styles.setting_item}>
            <div className={styles.setting_item_info}>
              <div className={styles.setting_item_title}>
                <span className={`material-symbols-outlined ${styles.setting_item_icon}`}>
                  schedule
                </span>

                <strong className="font_body_l_b">
                  전체 면접 시간 설정
                </strong>
              </div>

              <p className="font_body_m_r">
                면접 전체 시간을 설정합니다.
              </p>
            </div>

            <button
              type="button"
              className={`${styles.toggle_button} ${
                showTimer ? styles.is_on : ''
              }`}
              aria-pressed={showTimer}
              aria-label="전체 면접 시간 설정"
              onClick={() => onToggleShowTimer(!showTimer)}
            >
              <span className={styles.toggle_circle} />
            </button>
          </div>

          <div className={styles.setting_item}>
            <div className={styles.setting_item_info}>
              <div className={styles.setting_item_title}>
                <span className={`material-symbols-outlined ${styles.setting_item_icon}`}>
                  group
                </span>

                <strong className="font_body_l_b">
                  면접관 성격
                </strong>
              </div>

              <p className="font_body_m_r">
                면접관의 원하는 성격을 직접 설정할 수 있습니다.
              </p>
            </div>

            <div className={styles.select_wrapper}>
              <select
                className={`${styles.personality_select} font_body_m_r`}
                value={interviewerStyle}
                onChange={(e) => onInterviewerStyleChange(e.target.value)}
              >
                <option value="friendly">친절한</option>
                <option value="neutral">중립적인</option>
                <option value="pressure">엄격한</option>
              </select>

              <span className={`material-symbols-outlined ${styles.select_icon}`}>
                arrow_drop_down
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}