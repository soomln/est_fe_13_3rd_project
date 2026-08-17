import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"
import InterviewQuestionDetailHeader from "./InterviewQuestionReviewDetailHeader";
import InterviewQuestionDetailFooter from "./InterviewQuestionReviewDetailFooter";
import InterviewQuestionDetailComments from "./InterviewQuestionReviewDetailComments";


export default function InterviewQuestionReviewDetailContent({question, comments, reloadComments}){
  console.log(comments) 
  
  
  return (
    <div>
      <div className={styles.review_card}>
        <h1>면접 후기</h1>
        <h2>{question.title}</h2>
        <InterviewQuestionDetailHeader question={question}/>
        <InterviewQuestionDetailFooter question={question}/>
        
        <div className={styles.content}>
          {question.questionList.map((question, index) => (
          <div key={index}>
            <p>{index+1}. {question}</p>
          </div>
          ))}
        </div>

      <InterviewQuestionDetailComments
        comments={comments}
        postId={question.id}
        reloadComments={reloadComments}
      />
      </div>
    </div>
  );
}