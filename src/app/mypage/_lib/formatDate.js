// API 가 주는 ISO 시각을 화면용 2026.07.26 으로 바꾼다
export default function formatDate(iso) {
  if (!iso) return '';
  return iso.slice(0, 10).replace(/-/g, '.');
}
