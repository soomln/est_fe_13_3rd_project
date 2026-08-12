import styles from './ShotMock.module.sass';

// 주의: 팀 구현이 끝나면 이 폴더를 통째로 지우고 실제 스크린샷 이미지로 바꾼다

function EditorMock() {
  return (
    <div className={styles.mock_editor}>
      <div className={styles.mock_chat}>
        <p className={styles.mock_chat_head}>AI 도우미</p>
        <div className={`${styles.mock_bubble} ${styles.mock_bubble_ai}`} />
        <div className={`${styles.mock_bubble} ${styles.mock_bubble_me}`} />
        <div className={`${styles.mock_bubble} ${styles.mock_bubble_ai}`} />
        <div className={styles.mock_chat_input} />
      </div>
      <div className={styles.mock_paper}>
        <div className={styles.mock_paper_title} />
        <div className={styles.mock_line} />
        <div className={styles.mock_line} />
        <div className={`${styles.mock_line} ${styles.mock_line_short}`} />
        <div className={styles.mock_gap} />
        <div className={styles.mock_line} />
        <div className={`${styles.mock_line} ${styles.mock_line_short}`} />
      </div>
    </div>
  );
}

function InterviewMock() {
  return (
    <div className={styles.mock_qa}>
      <div className={styles.mock_qa_row}>
        <span className={styles.mock_badge_q}>Q</span>
        <div className={styles.mock_qa_text}>
          <div className={styles.mock_line} />
        </div>
      </div>
      <div className={styles.mock_qa_row}>
        <span className={styles.mock_badge_a}>A</span>
        <div className={styles.mock_answer}>
          <div className={styles.mock_line} />
          <div className={`${styles.mock_line} ${styles.mock_line_short}`} />
        </div>
      </div>
      <div className={styles.mock_qa_row}>
        <span className={styles.mock_badge_ai}>AI</span>
        <div className={styles.mock_feedback}>
          <p className={styles.mock_feedback_label}>AI 피드백</p>
          <div className={styles.mock_line} />
          <div className={`${styles.mock_line} ${styles.mock_line_short}`} />
        </div>
      </div>
    </div>
  );
}

function PortfolioMock() {
  return (
    <div className={styles.mock_gallery}>
      {[0, 1, 2, 3].map((n) => (
        <div key={n} className={styles.mock_pf}>
          <div className={styles.mock_pf_thumb} />
          <div className={styles.mock_pf_foot}>
            <span className={styles.mock_avatar} />
            <div className={`${styles.mock_line} ${styles.mock_line_tiny}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CompaniesMock() {
  return (
    <div className={styles.mock_company}>
      <div className={styles.mock_co_head}>
        <span className={styles.mock_co_logo} />
        <div className={styles.mock_co_name}>
          <div className={`${styles.mock_line} ${styles.mock_line_tiny}`} />
          <div
            className={`${styles.mock_line} ${styles.mock_line_tiny} ${styles.mock_line_short}`}
          />
        </div>
        <span className={styles.mock_co_score}>4.3</span>
      </div>
      <div className={styles.mock_review}>
        <div className={styles.mock_review_tags}>
          <span className={styles.mock_chip_green} />
          <span className={styles.mock_chip} />
          <span className={styles.mock_chip} />
        </div>
        <div className={styles.mock_line} />
        <div className={`${styles.mock_line} ${styles.mock_line_short}`} />
      </div>
      <div className={styles.mock_review}>
        <div className={styles.mock_review_tags}>
          <span className={styles.mock_chip_green} />
          <span className={styles.mock_chip} />
        </div>
        <div className={styles.mock_line} />
      </div>
    </div>
  );
}

const MOCKS = {
  resume: EditorMock,
  interview: InterviewMock,
  portfolio: PortfolioMock,
  companies: CompaniesMock,
};

export default function ShotMock({ kind }) {
  const Body = MOCKS[kind];

  return (
    <div className={styles.shot} aria-hidden='true'>
      <div className={styles.shot_bar}>
        <span /> <span /> <span />
      </div>
      <div className={styles.shot_body}>
        <Body />
      </div>
    </div>
  );
}
