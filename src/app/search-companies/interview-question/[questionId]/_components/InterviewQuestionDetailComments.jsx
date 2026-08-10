const sortOptions = ["추천순", "최신순"];


export default function InterviewQuestionDetailComments({question}){
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
      {question.comments.map((comment) => (
      <div key={comment.id}>
        <p>{comment.job} / {comment.education} {comment.date} {comment.time}</p>
        <p>{comment.content} 좋아요 수: {comment.likes}</p>
      </div>
      ))}
    </div>
  );
}