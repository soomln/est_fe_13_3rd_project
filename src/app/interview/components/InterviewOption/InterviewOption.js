import './InterviewOption.sass';

import ResumeSelect from '../ResumeSelect';
import CoverLetterSelect from '../CoverLetterSelect';
import CompanySearch from '../CompanySearch';
import ActionButton from '../ActionButton';

export default function InterviewOption() {
  return (
    <div className="interview_option">
      <h2 className="option_title font_h2">옵션</h2>

      <ResumeSelect />

      <CoverLetterSelect />

      <CompanySearch />

      <ActionButton
        text="질문 리스트 불러오기"
      />
    </div>
  );
}