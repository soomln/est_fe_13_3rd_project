// 이력서 제목과 프로필 항목을 짝지어 준다.
// "언 어" "언.어" "언·어" 처럼 띄어쓰기나 기호가 섞여도 같은 것으로 본다

// 띄어쓰기·기호를 걷어내고 소문자로 맞춘다
export function normalize(text) {
  return (text ?? '')
    .toLowerCase()
    .replace(/[\s·․.,/\-_~|()[\]{}<>:;'"!?]/g, '');
}

// 프로필 항목마다 이력서에서 쓰일 법한 제목들
const SECTIONS = [
  // "교육 및 활동" 은 부트캠프·대외활동 자리라 학력이 아니다. 사용자가 직접 쓴다
  { key: 'educations', names: ['학력', '학력사항', '학업', '출신학교', 'education'] },
  { key: 'careers', names: ['경력', '경력사항', '경력요약', '업무경험', '직무경험', 'experience', 'career'] },
  // "자격 및 어학" 처럼 둘이 같은 길이로 걸리면 앞에 쓴 쪽이 먼저 들어간다
  { key: 'awards', names: ['수상', '수상내역', '수상경력', '자격', '자격사항', '자격증', 'award', 'certificate'] },
  { key: 'languages', names: ['언어', '어학', '외국어', '어학능력', 'language'] },
  { key: 'headline', names: ['한줄소개', '자기소개', '나를한문장으로', 'summary', 'about'] },
  { key: 'contact', names: ['인적사항', '연락처', '기본정보', 'contact', 'profile'] },
  { key: 'skills', names: ['기술스택', '기술', '보유기술', '스킬', 'skills', 'techstack'] },
];

// 제목 하나가 어느 항목들에 해당하는지. "경력 · 학력" 처럼 둘을 겸하면 둘 다 준다.
// 얼마나 길게 맞았는지도 같이 준다. 같은 항목을 두 제목이 노리면 더 길게 맞은 쪽이 가져간다
export function matchSection(heading) {
  const target = normalize(heading);
  if (!target) return [];

  const hits = [];

  SECTIONS.forEach((section) => {
    // 제목 안에 이름이 들어 있으면 같은 것으로 본다.
    // 반대 방향(이름 안에 제목)은 "수상경력" 이 "경력" 에 걸려서 쓰지 않는다
    const found = section.names
      .filter((name) => target.includes(name))
      .sort((a, b) => b.length - a.length)[0];

    if (found) hits.push({ key: section.key, matched: found, length: found.length });
  });

  // 더 길게 맞은 쪽이 더 확실하다
  return hits.sort((a, b) => b.length - a.length).map(({ key, length }) => ({ key, length }));
}
