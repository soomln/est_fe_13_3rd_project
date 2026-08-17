'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getCodeGroups } from '@backend/lib/api/codes';
import { createPost } from '@backend/lib/api/posts';
import EvaluationRow from '@/app/search-companies/_components/EvaluationRow';
import FormField from '@/app/search-companies/_components/FormField';
import PostFormShell from '@/app/search-companies/_components/PostFormShell';
import { FormInput, FormSelect, FormTextarea } from '@/app/search-companies/_components/FormControls';
import { useCompany } from '@/app/search-companies/detail/_components/CompanyShell';
import { CHANNEL_ETC_CODE, SCORE_OPTIONS, toDifficultyCode } from '@/app/search-companies/_lib/options';

const CODE_GROUPS = ['pass_result', 'interview_channel'];

const EMPTY_FORM = {
  difficultyScore: '',
  problemScore: '',
  passResultCode: '',
  channelCode: '',
  channelEtc: '',
  questions: '',
};

export default function QuestionWriteClient() {
  const router = useRouter();
  const { company, companySlug } = useCompany();

  const [codes, setCodes] = useState({});
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const listHref = `/search-companies/detail/${companySlug}/interview-question`;

  useEffect(() => {
    let ignore = false;

    async function fetchCodes() {
      try {
        const result = await getCodeGroups(CODE_GROUPS);

        if (!ignore) setCodes(result);
      } catch (error) {
        console.error(error);
      }
    }

    fetchCodes();

    return () => {
      ignore = true;
    };
  }, []);

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.difficultyScore) return alert('면접 난이도를 선택해주세요.');
    if (!form.problemScore) return alert('문제 난이도를 선택해주세요.');
    if (!form.passResultCode) return alert('합격 여부를 선택해주세요.');
    if (!form.channelCode) return alert('면접 경로를 선택해주세요.');
    if (form.channelCode === CHANNEL_ETC_CODE && !form.channelEtc.trim()) {
      return alert('면접 경로를 입력해주세요.');
    }

    // 백엔드가 줄 단위로 잘라 질문 수를 센다
    const questions = form.questions
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');

    if (!questions) return alert('면접 질문을 입력해주세요.');

    const difficultyScore = Number(form.difficultyScore);

    setIsSubmitting(true);

    try {
      await createPost({
        postType: 'qbank',
        companyId: company.id,
        questions,
        difficultyScore,
        difficultyCode: toDifficultyCode(difficultyScore),
        problemScore: Number(form.problemScore),
        passResultCode: form.passResultCode,
        channelCode: form.channelCode,
        channelEtc: form.channelCode === CHANNEL_ETC_CODE ? form.channelEtc.trim() : null,
      });

      router.push(listHref);
    } catch (error) {
      console.error(error);
      alert('족보 등록에 실패했습니다.');
      setIsSubmitting(false);
    }
  };

  if (!company) {
    return <p>불러오는 중...</p>;
  }

  return (
    <PostFormShell
      title='면접 족보 작성'
      description='실제 면접 질문을 공유해 다른 사람에게 도움을 주세요 !'
      isSubmitting={isSubmitting}
      onCancel={() => router.push(listHref)}
      onSubmit={handleSubmit}
    >
      <EvaluationRow>
        <FormField label='면접 난이도' inline>
          <FormSelect
            value={form.difficultyScore}
            options={SCORE_OPTIONS}
            placeholder='면접 난이도'
            onChange={(value) => setValue('difficultyScore', value)}
          />
        </FormField>

        <FormField label='문제 난이도' inline>
          <FormSelect
            value={form.problemScore}
            options={SCORE_OPTIONS}
            placeholder='문제 난이도'
            onChange={(value) => setValue('problemScore', value)}
          />
        </FormField>

        <FormField label='합격 여부' inline>
          <FormSelect
            value={form.passResultCode}
            options={codes.pass_result ?? []}
            placeholder='합격 여부'
            onChange={(value) => setValue('passResultCode', value)}
          />
        </FormField>

        <FormField label='면접 경로' inline>
          <FormSelect
            value={form.channelCode}
            options={codes.interview_channel ?? []}
            placeholder='면접 경로'
            onChange={(value) => setValue('channelCode', value)}
          />
        </FormField>

        {form.channelCode === CHANNEL_ETC_CODE && (
          <FormInput
            value={form.channelEtc}
            placeholder='면접 경로를 입력해주세요.'
            onChange={(value) => setValue('channelEtc', value)}
            compact
          />
        )}
      </EvaluationRow>

      <FormField label='면접 질문'>
        <FormTextarea
          value={form.questions}
          placeholder='내용을 작성해주세요.'
          onChange={(value) => setValue('questions', value)}
        />
      </FormField>
    </PostFormShell>
  );
}
