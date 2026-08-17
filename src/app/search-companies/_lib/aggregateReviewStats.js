// 면접 후기 목록에서 통계 패널용 수치를 계산한다

const DIFFICULTY_ORDER = ['hard', 'normal', 'easy'];
const DIFFICULTY_LABEL = { easy: '쉬움', normal: '보통', hard: '어려움' };

const RESULT_ORDER = ['pass', 'waiting', 'fail'];
const RESULT_LABEL = { pass: '합격', waiting: '대기', fail: '불합격' };

const CHANNEL_ORDER = ['online', 'referral_friend', 'referral_school', 'job_fair', 'recruiter', 'etc'];
const CHANNEL_LABEL = {
  online: '온라인 지원',
  referral_friend: '지인 추천',
  referral_school: '학교 추천',
  job_fair: '채용 박람회',
  recruiter: '채용 담당자 제안',
  etc: '기타',
};

// 난이도 평균값에 대응하는 등급 문구
const DIFFICULTY_GRADE = [
  { max: 1.5, label: '매우 쉬움' },
  { max: 2.5, label: '쉬움' },
  { max: 3.5, label: '보통' },
  { max: 4.5, label: '어려움' },
  { max: 5, label: '매우 어려움' },
];

function ratioOf(reviews, key, order, labels) {
  const counts = new Map(order.map((code) => [code, 0]));
  let total = 0;

  for (const review of reviews) {
    const code = review[key];
    if (!counts.has(code)) continue;

    counts.set(code, counts.get(code) + 1);
    total += 1;
  }

  return order.map((code) => ({
    code,
    label: labels[code],
    value: total === 0 ? 0 : Math.round((counts.get(code) / total) * 100),
  }));
}

export default function aggregateReviewStats(reviews = []) {
  const scores = reviews.map((review) => review.difficultyScore).filter((score) => typeof score === 'number');

  const difficultyAvg =
    scores.length === 0 ? 0 : Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10;

  const difficultyGrade = DIFFICULTY_GRADE.find((grade) => difficultyAvg <= grade.max)?.label ?? '-';

  return {
    total: reviews.length,
    difficultyAvg,
    difficultyGrade,
    experienceRatio: ratioOf(reviews, 'difficultyCode', DIFFICULTY_ORDER, DIFFICULTY_LABEL),
    resultRatio: ratioOf(reviews, 'passResultCode', RESULT_ORDER, RESULT_LABEL),
    channelRatio: ratioOf(reviews, 'channelCode', CHANNEL_ORDER, CHANNEL_LABEL),
  };
}
