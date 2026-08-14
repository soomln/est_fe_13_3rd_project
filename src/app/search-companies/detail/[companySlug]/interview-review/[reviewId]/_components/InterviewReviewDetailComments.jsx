import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"


export default function InterviewReviewDetailComments({comments}){
  
  const sortOptions = ["추천순", "최신순"];

  return(
    <div>
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
          <p>
            {comment.authorName} · {comment.date}
          </p>

          <p>{comment.body}</p>

          <p>좋아요 {comment.likeCount}</p>
        </div>
      ))}
    </div>
  );
}