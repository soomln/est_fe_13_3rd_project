import styles from './InterviewResult.module.sass';

import FeedbackButton from '../FeedbackButton';
import RetryButton from '../RetryButton';
import { sumSubScores } from '../../_lib/evaluateInterviewAnswers';

export default function InterviewResult({
  scores = {},
  onFeedback,
  onRetry,
}) {
  const totalScore = sumSubScores(scores);

  return (
    <div className={styles.interview_result}>
      <div className={styles.score_box}>
        <h2 className="font_h4">최종 점수</h2>

        <p className={`${styles.total_score} font_title`}>
          {totalScore}점 <span className={`${styles.score_max} font_body_l_r`}>/ 100점</span>
        </p>

        <h3 className="font_h4">세부 항목 점수</h3>

        <div className={styles.detail_score}>
          <div className={styles.score_item}>
            <span className="font_body_l_r">
              답변내용
            </span>
            <span className="font_body_m_b">
              {scores.content}점 <span className={styles.score_max}>/ 20점</span>
            </span>
          </div>

          <div className={styles.score_item}>
            <span className="font_body_l_r">
              전달력
            </span>
            <span className="font_body_m_b">
              {scores.delivery}점 <span className={styles.score_max}>/ 20점</span>
            </span>
          </div>

          <div className={styles.score_item}>
            <span className="font_body_l_r">
              논리성
            </span>
            <span className="font_body_m_b">
              {scores.logic}점 <span className={styles.score_max}>/ 20점</span>
            </span>
          </div>

          <div className={styles.score_item}>
            <span className="font_body_l_r">
              전문성
            </span>
            <span className="font_body_m_b">
              {scores.skill}점 <span className={styles.score_max}>/ 20점</span>
            </span>
          </div>

          <div className={styles.score_item}>
            <span className="font_body_l_r">
              태도
            </span>
            <span className="font_body_m_b">
              {scores.attitude}점 <span className={styles.score_max}>/ 20점</span>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.button_group}>
        <FeedbackButton onClick={onFeedback} />
        <RetryButton onClick={onRetry} />
      </div>
    </div>
  );
}