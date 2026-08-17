// ISO datetime → 표시용 "YYYY.MM.DD" 문자열 (BACKEND.md의 Post.date 포맷과 동일 규칙)
export function formatDate(iso) {
  return iso ? iso.slice(0, 10).replace(/-/g, '.') : '';
}
