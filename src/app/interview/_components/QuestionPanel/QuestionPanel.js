import './QuestionPanel.sass';
import ActionButton from '../ActionButton';

export default function QuestionPanel({
  questions,
  selectedQuestion,
  onSelect,
  onStart,
}) {
  return (
    <section className="question_panel">
      <h2 className="panel_title font_h3">
        질문 리스트
      </h2>

      <div className="question_list">
        {/* 항상 표시되는 전체 */}
        <label className="question_item">
          <input
            type="radio"
            name="question"
            checked={selectedQuestion === 'all'}
            onChange={() => onSelect('all')}
          />

          <div className="question_content">
            <p className="question_title font_h4">
              전체
            </p>

            <p className="question_description font_body_m_r">
              처음부터 모든 질문을 순서대로 진행합니다.
            </p>
          </div>
        </label>

        {/* AI가 생성한 질문 */}
        {questions.map((question) => (
          <label
            key={question.id}
            className="question_item"
          >
            <input
              type="radio"
              name="question"
              checked={selectedQuestion === question.id}
              onChange={() => onSelect(question.id)}
            />

            <div className="question_content">
              <p className="question_title font_h4">
                {question.title}
              </p>

              <p className="question_description font_body_m_r">
                {question.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      <ActionButton
        text="선택한 질문으로 시작하기"
        onClick={onStart}
      />
    </section>
  );
}