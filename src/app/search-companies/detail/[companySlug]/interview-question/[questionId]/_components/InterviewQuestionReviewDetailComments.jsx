import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass";
const sortOptions = ["추천순", "최신순"];


export default function InterviewQuestionReviewDetailComments({comments}){
  console.log(comments)

  return(
    <div className={styles.review_card}>
      <span>
        {/* <img src="" alt="프로필 사진" /> */}
        <span>프로필 사진</span>
        <input type="text" placeholder="댓글을 입력해주세요." id="" /><button type="button">등록</button>
      </span>
      <select>
        {sortOptions.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
      {comments.map((comment) => (
      <div key={comment.id}>
        <img src={comment.authorAvatar} alt="댓글쓴이 아바타" />
        <p>
          {comment.authorName} {comment.job_role_code} / {comment.education_level} {comment.date} {new Date(comment.createdAt).toLocaleTimeString("ko-KR", {hour: "2-digit", minute: "2-digit", hour12: false,})}
        </p>
        <p>{comment.body} 좋아요 수: {comment.likeCount}</p>
      </div>
      ))}
    </div>
  );
}