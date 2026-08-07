'use client';

import { useState } from 'react';

import './InterviewOption.sass';

import ResumeSelect from '../ResumeSelect';
import CoverLetterSelect from '../CoverLetterSelect';
import CompanySearch from '../CompanySearch';
import ActionButton from '../ActionButton';

// 임시 데이터
const dummyResumes = [
  { id: 1, title: '이력서_2026.pdf' },
  { id: 2, title: '이력서_최종.pdf' },
];

const dummyCoverLetters = [
  { id: 1, title: '자기소개서_프론트엔드.pdf' },
  { id: 2, title: '자기소개서_백엔드.pdf' },
];

export default function InterviewOption() {
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState(null);

  return (
    <div className="interview_option">
      <h2 className="option_title font_h2">옵션</h2>

      <ResumeSelect
        resumes={dummyResumes}
        selectedResumeId={selectedResumeId}
        onSelectResume={setSelectedResumeId}
      />

      <CoverLetterSelect
        coverLetters={dummyCoverLetters}
        selectedId={selectedCoverLetterId}
        onSelect={setSelectedCoverLetterId}
      />

      <CompanySearch />

      <ActionButton
        text="질문 리스트 불러오기"
      />
    </div>
  );
}