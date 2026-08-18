import styles from './QbankCard.module.sass';

// 스크랩한 면접 질문 족보 카드
// onToggle 을 넘길 때만 선택용 체크박스가 나온다 (삭제모드)
export default function QbankCard({ qbank, isSelected = false, onToggle }) {
  const {
    companyName,
    companyLogo,
    difficulty,
    result,
    route,
    jobInfo,
    createdAt,
    questionList,
    bookmark,
    comment,
  } = qbank;

  return (
    <div className={`${styles.qbank_card} ${isSelected ? styles.qbank_card_selected : ''}`}>
      <div className={styles.qbank_card_company}>
        {onToggle && (
          <label
            className={styles.qbank_card_check}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <input
              type='checkbox'
              checked={isSelected}
              onChange={onToggle}
              aria-label={`${companyName} 족보 선택`}
            />
            <span className='material-symbols-sharp' aria-hidden='true'>
              check
            </span>
          </label>
        )}

        {companyLogo ? (
          <img src={companyLogo} alt='' className={styles.qbank_card_logo} />
        ) : (
          <span className={styles.qbank_card_logo_dummy} />
        )}
        <p className={`${styles.qbank_card_company_name} font_body_m_b`}>{companyName}</p>
      </div>

      <div className={styles.qbank_card_meta}>
        <div className={styles.qbank_card_tags}>
          <span className={styles.qbank_card_tag}>
            <span className='font_body_m_b'>면접 난이도</span>
            <span className={`${styles.qbank_card_difficulty} font_body_m_r`}>{difficulty}</span>
          </span>

          <span className={styles.qbank_card_tag}>
            <span className='font_body_m_b'>합격 여부</span>
            <span className={`${styles.qbank_card_value} font_body_m_r`}>{result}</span>
          </span>

          <span className={styles.qbank_card_tag}>
            <span className='font_body_m_b'>면접 경로</span>
            <span className={`${styles.qbank_card_value} font_body_m_r`}>{route}</span>
          </span>
        </div>

        <div className={styles.qbank_card_writer}>
          <span className='material-symbols-rounded' aria-hidden='true'>
            account_circle
          </span>
          <span className='font_body_m_r'>{jobInfo}</span>
          <span className='font_body_m_r'>{createdAt}</span>
        </div>
      </div>

      <ol className={styles.qbank_card_questions}>
        {(questionList ?? []).map((question) => (
          <li key={question} className='font_body_m_r'>
            {question}
          </li>
        ))}
      </ol>

      <div className={styles.qbank_card_counts}>
        <span className={styles.qbank_card_count}>
          <span className='material-symbols-sharp' aria-hidden='true'>
            bookmark
          </span>
          <span className='font_body_m_r'>퍼가요</span>
          <span className='font_body_m_r'>{bookmark}</span>
        </span>
        <span className='font_body_m_r'>댓글 {comment}</span>
      </div>
    </div>
  );
}
