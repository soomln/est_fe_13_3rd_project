import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"
import InterviewReviewDetailHeader from "./InterviewReviewDetailHeader";
import InterviewReviewDetailFooter from "./InterviewReviewDetailFooter";
import InterviewReviewDetailSummary from "./InterviewReviewDetailSummary";
import InterviewReviewDetailComments from "./InterviewReviewDetailComments";


export default function InterviewReviewDetailContent({review}){
  return (
    <div>
      <div className={styles.review_card}>
        <h1>면접 후기</h1>
        <h2>{review.title}</h2>
        <InterviewReviewDetailHeader review={review}/>
        <InterviewReviewDetailFooter review={review}/>
        <InterviewReviewDetailSummary review={review}/>
        
        <div className={styles.content}>
          <p>{review.content}</p>
        </div>

        <InterviewReviewDetailComments review={review}/>
      </div>
    </div>
  );
}