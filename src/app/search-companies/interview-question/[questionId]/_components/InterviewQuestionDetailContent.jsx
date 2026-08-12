import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"
import InterviewQuestionDetailHeader from "./InterviewQuestionDetailHeader";
import InterviewQuestionDetailFooter from "./InterviewQuestionDetailFooter";
import InterviewQuestionDetailComments from "./InterviewQuestionDetailComments";


export default function InterviewQuestionDetailContent({question}){
   return (
    <div>
      <div className={styles.review_card}>
        <h1>면접 후기</h1>
        <h2>{question.title}</h2>
        <InterviewQuestionDetailHeader question={question}/>
        <InterviewQuestionDetailFooter question={question}/>
        
        <div className={styles.content}>
          <p>{question.content}</p>
        </div>

        <InterviewQuestionDetailComments question={question}/>
      </div>
    </div>
  );
}