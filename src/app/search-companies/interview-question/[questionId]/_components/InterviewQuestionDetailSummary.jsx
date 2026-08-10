export default function InterviewQuestionDetailSummary({question}){
    return(
    <>
      <h1>면접 총평</h1>
      <article>
        <h2>면접 난이도</h2>
        <p>{question.difficulty} / 5.0</p>
      </article>
    </>
  );
}