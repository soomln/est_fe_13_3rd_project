"use client"

import FormSelect from "@/app/search-companies/_components/Form/FormSelect";
import FormInput from "@/app/search-companies/_components/Form/FormInput";
import FormTextarea from "@/app/search-companies/_components/Form/FormTextarea";
import FormWriteButton from "@/app/search-companies/_components/Form/FormWriteButton";
import { useState } from "react";
import { createPost } from "@backend/lib/api/posts";
import { useRouter } from "next/navigation";

const reviewDifficultyOption = [
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


export default function ReviewWriteForm({company}){
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    body: "",
    difficultyCode: "easy",
    passResultCode: "pass",
    channelCode: "online",
  });

const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => {
    const next = {
      ...prev,
      [name]: value,
    };

    return next;
  });
};




const handleSubmit = async () => {
  if (!form.difficultyCode) {
    alert("난이도를 선택해주세요.");
    return;
  }
  if (!form.passResultCode) {
    alert("합격 여부를 선택해주세요.");
    return;
  }
  if (!form.channelCode) {
    alert("면접 경로를 입력해주세요.");
    return;
  }
  if (!form.title) {
    alert("제목을 입력해주세요.");
    return;
  }
  if (!form.body) {
    alert("내용을 입력해주세요.");
    return;
  }

  try {
    await createPost({
      postType: "review",
      companyId: company.id,
      title: form.title,
      body: form.body,
      difficultyCode: form.difficultyCode,
      passResultCode: form.passResultCode,
      channelCode: form.channelCode,
    });

    router.push(
      `/search-companies/detail/${company.slug}/interview-review`
    );
  } catch (err) {
    console.error(err);
    alert("후기 등록에 실패했습니다.");
  }
};

const handleCancel = () => {
  router.push(
    `/search-companies/detail/${company.slug}/interview-review`
  );
};

  return(
    <>
      <FormSelect 
      name="difficultyCode"
      value={form.difficultyCode}
      onChange={handleChange}
      label="면접 난이도"
      options={reviewDifficultyOption}
      />
      <FormSelect 
      name="passResultCode"
      value={form.passResultCode}
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

      <FormInput 
      name="title"
      value={form.title}
      onChange={handleChange}
      label="제목"
      placeholder="제목을 작성해주세요."
      /> {/* 제목 */}

      <FormTextarea 
      name="body"
      value={form.body}
      onChange={handleChange}
      label="내용"
      placeholder="내용을 작성해주세요."
      />   {/* 내용 */}
      <FormWriteButton onSubmitClick={handleSubmit} onCancelClick={handleCancel}/>
    </>
  );
}