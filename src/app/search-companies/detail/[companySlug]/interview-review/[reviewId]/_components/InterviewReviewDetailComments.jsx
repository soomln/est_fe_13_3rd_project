import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"

import { useState } from "react";
import { createComment } from "@backend/lib/api/comments";

export default function InterviewReviewDetailComments({comments, postId, reloadComments}){
  
  const sortOptions = ["추천순", "최신순"];
    const [body, setBody] = useState("");
  
    const handleSubmit = async () => {
    if (!body.trim()) return;
  
    await createComment(postId, body);
    await reloadComments();
    setBody("");
    };

  return(
    <div className="styles.review_card">
      <span>
        {/* <img src="" alt="프로필 사진" /> */}
        <span>프로필 사진</span>
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="댓글을 입력해주세요."
          onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.nativeEvent.isComposing) return;
            e.preventDefault();
            handleSubmit();
          }
        }}
        />
        <button
          type="button"
          onClick={handleSubmit}
        >
          등록
        </button>
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
            {comment.authorName} · {comment.date}
          </p>

          <p>{comment.body}</p>

          <p>좋아요 {comment.likeCount}</p>
        </div>
      ))}
    </div>
  );
}