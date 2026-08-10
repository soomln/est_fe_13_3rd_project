import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"

export default function InterviewReviewDetailSummary({review}){
  return(
    <>
      <h1>면접 총평</h1>
      <article>
        <h2>면접 난이도</h2>
        <p>{review.difficulty} / 5.0</p>
        <p>{review.summary}</p>
      </article>
    </>
  );
}