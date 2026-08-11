import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"
import InterviewQuestionDetailHeader from "./InterviewQuestionDetailHeader";
import InterviewQuestionDetailFooter from "./InterviewQuestionDetailFooter";
import InterviewQuestionDetailSummary from "./InterviewQuestionDetailSummary";
import InterviewQuestionDetailComments from "./InterviewQuestionDetailComments";


export default function InterviewQuestionDetailContent({review}){
   return (
    <div>
      <div className={styles.review_card}>
        <h1>면접 후기</h1>
        <h2>{review.title}</h2>
        <InterviewQuestionDetailHeader review={review}/>
        <InterviewQuestionDetailFooter review={review}/>
        <InterviewQuestionDetailSummary review={review}/>
        
        <div className={styles.content}>
          <p>{review.content}</p>
        </div>

        <InterviewQuestionDetailComments review={review}/>
      </div>
    </div>
  );
}