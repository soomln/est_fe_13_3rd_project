"use client"

import FormSelect from "@/app/search-companies/_components/Form/FormSelect";
import FormInput from "@/app/search-companies/_components/Form/FormInput";
import FormTextarea from "@/app/search-companies/_components/Form/FormTextarea";
import FormWriteButton from "@/app/search-companies/_components/Form/FormWriteButton";
import QuestionArrayWriteForm from "./QuestionArrayWriteForm";
import { useState } from "react";
import { createPost } from "@backend/lib/api/posts";
import { useRouter } from "next/navigation";

const questionDifficultyOption = [
  { value: "easy", label: "쉬움" },
  { value: "normal", label: "보통" },
  { value: "hard", label: "어려움" },
];
const resultOption = [
  { value: "pass", label: "합격" },
  { value: "fail", label: "불합격" },
  { value: "waiting", label: "대기중" },
];
const channelCodeOption = [
  { value: "online", label: "온라인" },
  { value: "referral_friend", label: "지인 추천" },
  { value: "referral_school", label: "학교 추천" },
  { value: "job_fair", label: "채용 박람회" },
  { value: "recruiter", label: "채용 담장자 제안" },
  { value: "etc", label: "기타" },
]


export default function QuestionWriteForm({company}){
  const [questions, setQuestions] = useState([""]);

  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    questions: [],
    difficultyCode: "easy",
    passResultCode: "pass",
    channelCode: "online",
  });

  const handleAddQuestion = () => {
  setQuestions((prev) => [...prev, ""]);
  };

  const handleQuestionChange = (index, value) => {
    const next = [...questions];
    next[index] = value;
    setQuestions(next);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length === 1) {
      return;
    }

    setQuestions((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
    }));
    console.log(name + ": "+ value)
  }; 

  const handleSubmit = async () => {
  try {

    if (!form.difficultyCode) {
      alert("난이도를 선택해주세요.");
      return;
    }
    if (!form.passResultCode) {
      alert("합격 여부를 선택해주세요.");
      return;
    }
    if (!form.channelCode) {
      alert("면접 경로를 선택해주세요.");
      return;
    }
    if (questions.some((q) => q.trim() === "")) {
    alert("모든 질문을 입력해주세요.");
    return;
  } 


    await createPost({
      postType: "qbank",
      companyId: company.id,
      title: form.title,
      questions,
      difficultyCode: form.difficultyCode,
      passResultCode: form.passResultCode,
      channelCode: form.channelCode,
    });

    router.push(
      `/search-companies/detail/${company.slug}/interview-question`
    );
  } catch (err) {
    console.error(err);
    alert("족보 등록에 실패했습니다.");
  }
  };
  
  const handleCancel = () => {
  router.push(
    `/search-companies/detail/${company.slug}/interview-question`
  );
  };

  return(
    <>
      <FormSelect 
      name="difficultyCode"
      onChange={handleChange}
      label="문제 난이도"
      options={questionDifficultyOption}
      />
      <FormSelect 
      name="passResultCode"
      onChange={handleChange}
      label="합격 여부"
      options={resultOption}
      />
      <FormSelect
      name="channelCode"
      onChange={handleChange}
      label="면접 경로"
      options={channelCodeOption}
      // placeholder="면접 경로를 작성해주세요."
      /> {/* 면접 경로 */}

      <QuestionArrayWriteForm 
        questions={questions} 
        onQuestionChange={handleQuestionChange}
        onAddQuestion={handleAddQuestion}
        onRemoveQuestion={handleRemoveQuestion}
      />
      <FormWriteButton onSubmitClick={handleSubmit} onCancelClick={handleCancel}/>
    </>
  );
}