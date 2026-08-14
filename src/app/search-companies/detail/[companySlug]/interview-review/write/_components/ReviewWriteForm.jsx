"use client"

import FormSelect from "@/app/search-companies/_components/Form/FormSelect";
import FormInput from "@/app/search-companies/_components/Form/FormInput";
import FormTextarea from "@/app/search-companies/_components/Form/FormTextarea";
import FormWriteButton from "@/app/search-companies/_components/Form/WriteButtons";
import { useState } from "react";
import { createPost } from "@backend/lib/api/posts";

const reviewDifficultyOption = ["쉬움", "보통", "어려움"];
const questionDifficultyOption = ["쉬움", "보통", "어려움"];
const resultOption = ["합격", "불합격"];


export default function ReviewWriteForm({company}){
  const [form, setForm] = useState({
    title: "",
    body: "",
    difficulty_code: "",
    pass_result_code: "",
    channel_code: "",
  });

  const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: value,
    }));
    console.log(name + ": "+ value)
  };  
  const handleSubmit = async () => {
    await createPost({
      postType: "review",
      companyId: company.id,
      body: form.body,

      // 나머지는 일단 하나씩 채워 넣기
    });
    console.log(form);
  };

  return(
    <>
      <FormSelect 
      name="difficulty_code"
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
      name="pass_result_code"
      value={form.pass_result_code}
      onChange={handleChange}
      label="합격 여부"
      options={resultOption}
      />
      <FormInput 
      name="channel_code"
      value={form.channel_code}
      onChange={handleChange}
      label="면접 경로"
      placeholder="면접 경로를 작성해주세요."
      /> {/* 면접 경로 */}

      <FormInput 
      name="title"
      value={form.title}
      onChange={handleChange}
      label="제목"
      placeholder="제목을 작성해주세요."
      />      {/* 제목 */}

      <FormTextarea 
      name="body"
      value={form.body}
      onChange={handleChange}
      label="내용"
      placeholder="내용을 작성해주세요."
      />   {/* 내용 */}
      <FormWriteButton onSubmitClick={handleSubmit}/>
    </>
  );
}