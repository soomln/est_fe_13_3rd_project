import './InterviewResult.sass';

import FeedbackButton from '../FeedbackButton';
import RetryButton from '../RetryButton';

export default function InterviewResult({
  totalScore,
  scores = {},
  onFeedback,
  onRetry,
}) {
  return (
    <div className="interview_result">
      <div className="score_box">
        <h2 className="font_h4">최종 점수</h2>

        <p className="total_score font_title">
          {totalScore}점
        </p>

        <h3 className="font_h4">세부 항목 점수</h3>

        <div className="detail_score">
          <div className="score_item">
            <span className="font_body_l_r">
              답변내용
            </span>
            <span className="font_body_m_b">
              {scores.content}점
            </span>
          </div>

          <div className="score_item">
            <span className="font_body_l_r">
              전달력
            </span>
            <span className="font_body_m_b">
              {scores.delivery}점
            </span>
          </div>

          <div className="score_item">
            <span className="font_body_l_r">
              논리성
            </span>
            <span className="font_body_m_b">
              {scores.logic}점
            </span>
          </div>

          <div className="score_item">
            <span className="font_body_l_r">
              전문성
            </span>
            <span className="font_body_m_b">
              {scores.skill}점
            </span>
          </div>

          <div className="score_item">
            <span className="font_body_l_r">
              태도
            </span>
            <span className="font_body_m_b">
              {scores.attitude}점
            </span>
          </div>
        </div>
      </div>

      <div className="button_group">
        <FeedbackButton onClick={onFeedback} />
        <RetryButton onClick={onRetry} />
      </div>
    </div>
  );
}