export default function InterviewReviewCard({review}){
  return(
    <article className="reviewCard">
      {/* 메타 정보 */}
      <div className="meta">
        <div className="tags">
          <div className="tag">
            <span>면접 난이도</span>
            <strong>{review.difficulty}</strong>
          </div>

          <div className="tag">
            <span>합격 여부</span>
            <strong>{review.result}</strong>
          </div>

          <div className="tag">
            <span>면접 경로</span>
            <strong>{review.route}</strong>
          </div>
        </div>

        <div className="writerInfo">
            <span>👤 {review.job} / {review.education}</span>
            <span> | </span>
            <span>📅 {review.date}</span>
        </div>
      </div>

      {/* 후기 내용 */}
      <div className="content">
        <h3>{review.title}</h3>
        <p>{review.content}</p>        
      </div>

      {/* 반응 정보 */}
      <div className="actions">
          <div>
            🔖 퍼가요 {review.bookmark}
          </div>
          <div>
            댓글 {review.comment}
          </div>
      </div>
    </article>
  );
}