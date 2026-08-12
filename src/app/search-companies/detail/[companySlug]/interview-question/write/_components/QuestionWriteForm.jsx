"use client"

import FormSelect from "@/app/search-companies/_components/Form/FormSelect";
import FormInput from "@/app/search-companies/_components/Form/FormInput";
import FormTextarea from "@/app/search-companies/_components/Form/FormTextarea";
import FormWriteButton from "@/app/search-companies/_components/Form/WriteButtons";
import { useState } from "react";

const reviewDifficultyOption = ["쉬움", "보통", "어려움"];
const questionDifficultyOption = ["쉬움", "보통", "어려움"];
const resultOption = ["합격", "불합격"];


export default function QuestionWriteForm(){
  const [form, setForm] = useState({
    difficulty: "",
    questionDifficulty: "",
    result: "",
    route: "",
    content: "",
  });

  const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
    }));
    console.log(name + ": "+ value)
  };

  return(
    <>
      <FormSelect 
      name="reviewDifficulty"
      value={form.reviewDifficulty}
      onChange={handleChange}
      label="면접 난이도"
      options={reviewDifficultyOption}
      />
      <FormSelect 
      name="questionDifficulty"
      value={form.questionDifficulty}
      onChange={handleChange}
      label="문제 난이도"
      options={questionDifficultyOption}
      />
      <FormSelect 
      name="result"
      value={form.result}
      onChange={handleChange}
      label="합격 여부"
      options={resultOption}
      />
      <FormInput 
      name="route"
      value={form.route}
      onChange={handleChange}
      label="면접 경로"
      placeholder="면접 경로를 작성해주세요."
      /> {/* 면접 경로 */}

      <FormTextarea 
      name="content"
      value={form.content}
      onChange={handleChange}
      label="내용"
      placeholder="내용을 작성해주세요."
      />   {/* 내용 */}
      <FormWriteButton/>
    </>
  );
}