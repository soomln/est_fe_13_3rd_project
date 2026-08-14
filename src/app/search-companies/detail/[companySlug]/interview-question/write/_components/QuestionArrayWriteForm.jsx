import FormTextarea from "@/app/search-companies/_components/Form/FormTextarea"

export default function QuestionArrayWriteForm({questions, onQuestionChange, onAddQuestion, onRemoveQuestion}){
  return(
    <>
    {questions.map((question, index) => (
      <div key={index}>
        <FormTextarea
        label={`질문 ${index + 1}`}
        value={question}
        placeholder={"질문을 작성해주세요."}
        onChange={(e) => onQuestionChange(index, e.target.value)}
        />
      {questions.length > 1 && (
        <button
          type="button"
          onClick={() => onRemoveQuestion(index)}
        >
          - 질문 삭제
        </button>
      )}
      </div>
    ))}

    <button type="button" onClick={onAddQuestion}>
      + 질문 추가
    </button>

    </>
  );
}