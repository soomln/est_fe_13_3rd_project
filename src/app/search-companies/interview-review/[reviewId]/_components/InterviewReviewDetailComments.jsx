import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"

export default function InterviewReviewDetailComments({review}){
  return(
    <div>
      <span>
        {/* <img src="" alt="프로필 사진" /> */}
        <span>프로필 사진</span>
        <input type="text" placeholder="댓글을 입력해주세요." id="" /><button type="button">등록</button>
      </span>
      {review.comments.map((comment) => (
      <div key={comment.id}>
        <p>{comment.job} / {comment.education} {comment.date} {comment.time}</p>
        <p>{comment.content} 좋아요 수: {comment.likes}</p>
      </div>
      ))}
    </div>
  );
}